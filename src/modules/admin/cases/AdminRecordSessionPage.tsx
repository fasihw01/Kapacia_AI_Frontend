import { useState } from "react";
import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record";
import fixWebmDuration from "fix-webm-duration";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  useCreateSession,
  useStartRecording,
  useStopRecording,
  useUploadRecording,
} from "@/hooks/useSessions";
import { useTranscription } from "@/hooks/useTranscription";
import { useGenerateSoapNote } from "@/hooks/useSoap";
import {
  resampleAudio,
  validatePCMBuffer,
  logAudioStats,
} from "@/utils/audioUtils";
import { useAuth } from "@/contexts/useAuth";
import { toast } from "react-toastify";
import { getTranscriptBySession } from "@/services/transcriptService/transcriptService";
import {
  RecordHeader,
  SessionDetailsForm,
  PatientConsentForm,
  AdvancedOptionsForm,
  AudioRecordingPanel,
  TranscriptPanel,
  RecordingWarnings,
  RecordingActions,
  RECORDING_TIME_LIMIT,
  formatBytesToMb,
  getCurrentDate,
} from "@/modules/practitioner/cases/components";

export const AdminRecordSessionPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sessionName, setSessionName] = useState("");
  const [remarks, setRemarks] = useState("");
  const [sessionDate, setSessionDate] = useState(getCurrentDate());
  const [sessionLanguage, setSessionLanguage] = useState(
    user?.language || "english",
  );
  const [patientSignature, setPatientSignature] = useState("");
  const [consentDate, setConsentDate] = useState(getCurrentDate());
  const [consent, setConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState("00:00:00");
  const [piiMasking, setPiiMasking] = useState(user?.piiMasking !== false);
  const [allowTranscript, setAllowTranscript] = useState(true);
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState("0.00 MB");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  const [captureMode, setCaptureMode] = useState<"mic" | "mic+system">("mic");
  const [systemAudioConsent, setSystemAudioConsent] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [systemLevel, setSystemLevel] = useState(0);
  const [activeSource, setActiveSource] = useState<
    "mic" | "system" | "both" | "none"
  >("none");

  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const desktopStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const mixedStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const systemAnalyserRef = useRef<AnalyserNode | null>(null);
  const levelMonitorIntervalRef = useRef<number | null>(null);

  const createSessionMutation = useCreateSession();
  const startRecordingMutation = useStartRecording();
  const stopRecordingMutation = useStopRecording();
  const uploadRecordingMutation = useUploadRecording();
  const generateSoapNoteMutation = useGenerateSoapNote();

  const {
    transcriptEntries,
    currentPartialTranscript,
    isConnected: isTranscriptionConnected,
    error: transcriptionError,
    connect: connectTranscription,
    disconnect: disconnectTranscription,
    sendAudioChunk,
  } = useTranscription();

  const waveformRef = useRef<HTMLDivElement>(
    null,
  ) as React.RefObject<HTMLDivElement | null>;
  const waveSurferRef = useRef<WaveSurfer | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  console.log("recordedBlob", recordedBlob);
  const recordPluginRef = useRef<ReturnType<typeof RecordPlugin.create> | null>(
    null,
  );

  const timerRef = useRef<number | null>(null);
  const elapsedSecondsRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number | null>(null);
  const pauseStartTimeRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!waveformRef.current) return;

    const waveSurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#c7d2fe",
      progressColor: "#188aec",
      cursorColor: "#188aec",
      height: 80,
      barWidth: 3,
      barGap: 2,
      normalize: true,
    });

    const record = waveSurfer.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
      }),
    );

    record.on("record-end", (blob: Blob) => {
      setRecordedBlob(blob);
    });

    waveSurferRef.current = waveSurfer;
    recordPluginRef.current = record;

    return () => {
      waveSurfer.destroy();
    };
  }, []);

  const checkSystemAudioSupport = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      toast.error(
        "System audio capture is not supported in this browser. Please use Chrome or Edge.",
      );
      return false;
    }
    return true;
  };

  const startAudioLevelMonitoring = () => {
    if (captureMode !== "mic+system") return;

    const monitorLevels = () => {
      let micVol = 0;
      let sysVol = 0;

      if (micAnalyserRef.current) {
        const micData = new Uint8Array(micAnalyserRef.current.frequencyBinCount);
        micAnalyserRef.current.getByteFrequencyData(micData);
        micVol = micData.reduce((sum, val) => sum + val, 0) / micData.length;
      }

      if (systemAnalyserRef.current) {
        const sysData = new Uint8Array(systemAnalyserRef.current.frequencyBinCount);
        systemAnalyserRef.current.getByteFrequencyData(sysData);
        sysVol = sysData.reduce((sum, val) => sum + val, 0) / sysData.length;
      }

      const micLvl = Math.min(100, (micVol / 128) * 100);
      const sysLvl = Math.min(100, (sysVol / 128) * 100);

      setMicLevel(micLvl);
      setSystemLevel(sysLvl);

      const micActive = micLvl > 10;
      const sysActive = sysLvl > 10;

      if (micActive && sysActive) setActiveSource("both");
      else if (micActive) setActiveSource("mic");
      else if (sysActive) setActiveSource("system");
      else setActiveSource("none");
    };

    levelMonitorIntervalRef.current = window.setInterval(monitorLevels, 100);
  };

  const stopAudioLevelMonitoring = () => {
    if (levelMonitorIntervalRef.current) {
      clearInterval(levelMonitorIntervalRef.current);
      levelMonitorIntervalRef.current = null;
    }
    setMicLevel(0);
    setSystemLevel(0);
    setActiveSource("none");
  };

  const startTimer = () => {
    const segmentStartTime = Date.now() - elapsedSecondsRef.current * 1000;

    timerRef.current = window.setInterval(() => {
      if (isPausedRef.current) return;

      const totalMs = Date.now() - segmentStartTime;
      const totalSecs = Math.floor(totalMs / 1000);
      elapsedSecondsRef.current = totalSecs;

      const h = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
      const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
      const s = String(totalSecs % 60).padStart(2, "0");
      setRecordingTime(`${h}:${m}:${s}`);

      if (totalSecs >= RECORDING_TIME_LIMIT) handleStopRecording();
    }, 500);
  };

  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isRecording || !currentSessionId) return;

    const handleTranscriptToggle = async () => {
      if (allowTranscript) {
        try {
          await connectTranscription(currentSessionId);
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          console.error("[Pause/Resume] Failed to reconnect:", error);
        }
      } else {
        disconnectTranscription();
      }
    };

    handleTranscriptToggle();
  }, [allowTranscript, isRecording, currentSessionId, connectTranscription, disconnectTranscription]);

  // Navigate to admin session view after saving
  const handleSaveSession = () => {
    if (!recordedBlobRef.current || !currentSessionId) return;

    const audioUrl = URL.createObjectURL(recordedBlobRef.current);

    navigate(`/admin/cases/${caseId}/session/${currentSessionId}`, {
      state: {
        audioUrl,
        audioBlob: recordedBlobRef.current,
        sessionMeta: {
          date: sessionDate,
          language: sessionLanguage,
          piiMasking,
        },
      },
    });
  };

  const handleStartRecording = async () => {
    if (!consent || !caseId) return;

    if (captureMode === "mic+system" && !systemAudioConsent) {
      toast.error("Please provide consent for system audio capture");
      return;
    }

    setIsStarting(true);

    try {
      const sessionResponse = await createSessionMutation.mutateAsync({
        caseId,
        sessionName: sessionName.trim(),
        remarks: remarks.trim(),
        sessionDate,
        language: sessionLanguage,
        piiMaskingEnabled: piiMasking,
        consentGiven: consent,
        consentTimestamp: consentDate,
        clientName: patientSignature.trim(),
      });

      const sessionId = sessionResponse.session._id;
      setCurrentSessionId(sessionId);

      await startRecordingMutation.mutateAsync(sessionId);

      let finalStream: MediaStream;

      if (captureMode === "mic+system") {
        if (!checkSystemAudioSupport()) throw new Error("System audio capture not supported");

        try {
          const displayStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1, height: 1, frameRate: 1 },
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });

          desktopStreamRef.current = displayStream;
          displayStream.getVideoTracks()[0].addEventListener("ended", () => {
            toast.warning("Screen sharing stopped. Switching to microphone only.");
            stopAudioLevelMonitoring();
          });

          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
          });

          micStreamRef.current = micStream;

          const audioContext = new AudioContext({ sampleRate: 16000 });
          audioContextRef.current = audioContext;

          const micSource = audioContext.createMediaStreamSource(micStream);
          const desktopSource = audioContext.createMediaStreamSource(displayStream);
          const micAnalyser = audioContext.createAnalyser();
          const systemAnalyser = audioContext.createAnalyser();
          micAnalyser.fftSize = 256;
          systemAnalyser.fftSize = 256;
          micAnalyserRef.current = micAnalyser;
          systemAnalyserRef.current = systemAnalyser;

          const micGain = audioContext.createGain();
          const systemGain = audioContext.createGain();
          micGain.gain.value = 0.8;
          systemGain.gain.value = 1.2;

          const destination = audioContext.createMediaStreamDestination();
          micSource.connect(micAnalyser);
          micAnalyser.connect(micGain);
          micGain.connect(destination);
          desktopSource.connect(systemAnalyser);
          systemAnalyser.connect(systemGain);
          systemGain.connect(destination);

          finalStream = destination.stream;
          mixedStreamRef.current = finalStream;
          startAudioLevelMonitoring();
          toast.success("Recording microphone + system audio");
        } catch (displayError) {
          console.error("[System Audio] Failed to get display media:", displayError);
          toast.warning("System audio capture failed. Using microphone only.");
          const micStream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
          });
          finalStream = micStream;
          micStreamRef.current = micStream;
        }
      } else {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 },
        });
        finalStream = micStream;
        micStreamRef.current = micStream;
      }

      mediaStreamRef.current = finalStream;

      if (allowTranscript) {
        await connectTranscription(sessionId);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      let processingAudioContext: AudioContext;
      if (captureMode === "mic+system" && audioContextRef.current) {
        processingAudioContext = audioContextRef.current;
      } else {
        processingAudioContext = new AudioContext({ sampleRate: 16000 });
        audioContextRef.current = processingAudioContext;
      }

      const sourceNode = processingAudioContext.createMediaStreamSource(finalStream);
      const processorNode = processingAudioContext.createScriptProcessor(4096, 1, 1);
      audioSourceRef.current = sourceNode;
      processorRef.current = processorNode;

      processorNode.onaudioprocess = (e) => {
        if (!allowTranscript) return;
        try {
          const input = e.inputBuffer.getChannelData(0);
          const pcmData = resampleAudio(input, processingAudioContext.sampleRate, 16000);
          const arrayBuffer = pcmData.buffer as ArrayBuffer;
          if (validatePCMBuffer(arrayBuffer)) {
            const processor = processorRef.current as ScriptProcessorNode & { debugLogged?: boolean };
            if (processor && !processor.debugLogged) {
              logAudioStats(arrayBuffer, "First PCM Chunk");
              processor.debugLogged = true;
            }
            sendAudioChunk(new Blob([arrayBuffer], { type: "application/octet-stream" }));
          }
        } catch (error) {
          console.error("[Audio Processing] Error:", error);
        }
      };

      sourceNode.connect(processorNode);
      processorNode.connect(processingAudioContext.destination);

      const mediaRecorder = new MediaRecorder(finalStream, { mimeType: "audio/webm;codecs=opus" });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          const totalBytes = audioChunksRef.current.reduce((acc, chunk) => acc + chunk.size, 0);
          setFileSizeMb(formatBytesToMb(totalBytes));
        }
      };

      mediaRecorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        recordedBlobRef.current = finalBlob;
        setRecordedBlob(finalBlob);
        setFileSizeMb(formatBytesToMb(finalBlob.size));

        finalStream.getTracks().forEach((track) => track.stop());
        if (desktopStreamRef.current) desktopStreamRef.current.getTracks().forEach((t) => t.stop());
        if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());

        stopAudioLevelMonitoring();
        if (processorNode) processorNode.disconnect();
        if (sourceNode) sourceNode.disconnect();
        if (processingAudioContext && processingAudioContext.state !== "closed") {
          processingAudioContext.close();
        }
        audioContextRef.current = null;
        audioSourceRef.current = null;
        processorRef.current = null;
      };

      mediaRecorder.start(1000);

      if (recordPluginRef.current) await recordPluginRef.current.startRecording();

      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime("00:00:00");
      setSessionStartTime(
        new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }),
      );
      setFileSizeMb("0.00 MB");
      elapsedSecondsRef.current = 0;
      pauseStartTimeRef.current = null;
      totalPausedTimeRef.current = 0;
      recordingStartTimeRef.current = Date.now();
      startTimer();
    } catch (error) {
      console.error("Failed to start recording:", error);
      if (desktopStreamRef.current) { desktopStreamRef.current.getTracks().forEach((t) => t.stop()); desktopStreamRef.current = null; }
      if (micStreamRef.current) { micStreamRef.current.getTracks().forEach((t) => t.stop()); micStreamRef.current = null; }
      stopAudioLevelMonitoring();
      alert("Failed to start recording. Please try again.");
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopRecording = async () => {
    if (!currentSessionId) return;

    const result = await Swal.fire({
      title: "Stop Recording?",
      text: "Are you sure you want to stop recording and save this session?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#188aec",
      cancelButtonColor: "#ff0105",
      confirmButtonText: "Yes, Stop & Save",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: "Processing Recording...",
      text: "Please wait while we upload and save your recording.",
      icon: "info",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
          }
          if (recordPluginRef.current) await recordPluginRef.current.stopRecording();
          if (processorRef.current) { processorRef.current.disconnect(); processorRef.current = null; }
          if (audioSourceRef.current) { audioSourceRef.current.disconnect(); audioSourceRef.current = null; }
          if (allowTranscript) disconnectTranscription();
          stopAudioLevelMonitoring();

          const durationSeconds = elapsedSecondsRef.current;
          stopTimer();
          elapsedSecondsRef.current = 0;
          setIsRecording(false);
          setIsPaused(false);

          let attempts = 0;
          while (!recordedBlobRef.current && attempts < 50) {
            await new Promise((resolve) => setTimeout(resolve, 10));
            attempts++;
          }

          if (!recordedBlobRef.current) throw new Error("No audio recording found after timeout");

          const fixedBlob = await fixWebmDuration(recordedBlobRef.current, durationSeconds * 1000, { logger: false });
          recordedBlobRef.current = fixedBlob;
          setRecordedBlob(fixedBlob);

          if (audioContextRef.current && audioContextRef.current.state !== "closed") {
            try { await audioContextRef.current.close(); } catch (err) { console.warn(err); }
            audioContextRef.current = null;
          }

          const audioFileSizeBytes = recordedBlobRef.current.size;
          const formData = new FormData();
          formData.append("sessionId", currentSessionId);
          formData.append("audio", recordedBlobRef.current, `session-${currentSessionId}.webm`);
          formData.append("durationSeconds", durationSeconds.toString());
          formData.append("audioFileSizeBytes", audioFileSizeBytes.toString());

          const uploadData = await uploadRecordingMutation.mutateAsync({ sessionId: currentSessionId, formData });
          const uploadedAudioUrl = uploadData?.session?.audioUrl || uploadData?.audioUrl;
          if (!uploadedAudioUrl) throw new Error("Audio URL missing from upload response");

          await stopRecordingMutation.mutateAsync({ sessionId: currentSessionId, data: { audioFileSizeBytes, durationSeconds } });

          let transcriptTextForSoap = "";
          try {
            const transcriptResponse = await getTranscriptBySession(currentSessionId);
            const transcriptData = transcriptResponse?.transcript || transcriptResponse?.data?.transcript || transcriptResponse?.data;
            if (transcriptData?.rawText) {
              transcriptTextForSoap = transcriptData.rawText;
            } else if (transcriptData?.segments?.length > 0) {
              transcriptTextForSoap = transcriptData.segments
                .map((s: Record<string, unknown>) => `[${s.timestamp || new Date().toISOString()}] ${s.speaker || "Speaker"}: ${s.text || ""}`)
                .join("\n");
            }
          } catch (transcriptError) {
            console.error("[Stop Recording] Failed to fetch live transcript:", transcriptError);
            if (transcriptEntries.length > 0) {
              transcriptTextForSoap = transcriptEntries.map((e) => `[${e.timestamp}] ${e.speaker}: ${e.text}`).join("\n");
            }
          }

          try {
            await generateSoapNoteMutation.mutateAsync({
              sessionId: currentSessionId,
              framework: "SOAP" as const,
              temperature: 0.2,
              maxTokens: 1200,
              ...(transcriptTextForSoap && { transcriptText: transcriptTextForSoap }),
            });
          } catch (soapError) {
            console.error("[Stop Recording] Failed to generate SOAP note:", soapError);
          }

          Swal.fire({ title: "Success!", text: "Recording has been saved successfully.", icon: "success", confirmButtonColor: "#188aec" });
          handleSaveSession();
        } catch (error) {
          console.error("Failed to stop recording:", error);
          Swal.fire({
            title: "Error",
            text: error instanceof Error ? error.message : "Failed to save recording. Please try again.",
            icon: "error",
            confirmButtonColor: "#188aec",
          });
        }
      },
    });
  };

  const handlePauseRecording = async () => {
    if (!mediaRecorderRef.current || !currentSessionId) return;

    if (isPaused) {
      if (mediaRecorderRef.current.state === "paused") mediaRecorderRef.current.resume();
      if (recordPluginRef.current) recordPluginRef.current.resumeRecording();

      if (pauseStartTimeRef.current) {
        totalPausedTimeRef.current += Date.now() - pauseStartTimeRef.current;
        pauseStartTimeRef.current = null;
      }

      if (allowTranscript) {
        try {
          await connectTranscription(currentSessionId);
          await new Promise((resolve) => setTimeout(resolve, 300));
        } catch (error) {
          console.error("[Pause] Failed to reconnect transcription:", error);
        }
      }

      if (captureMode === "mic+system") startAudioLevelMonitoring();
      isPausedRef.current = false;
      startTimer();
    } else {
      if (mediaRecorderRef.current.state === "recording") mediaRecorderRef.current.pause();
      if (recordPluginRef.current) recordPluginRef.current.pauseRecording();

      pauseStartTimeRef.current = Date.now();
      if (allowTranscript) disconnectTranscription();
      stopAudioLevelMonitoring();
      isPausedRef.current = true;
      stopTimer();
    }

    setIsPaused(!isPaused);
  };

  return (
    <div className="flex flex-col space-y-6 mx-auto">
      <RecordHeader caseId={caseId!} basePath="/admin/cases" />
      <SessionDetailsForm
        sessionName={sessionName}
        onSessionNameChange={setSessionName}
        sessionDate={sessionDate}
        onSessionDateChange={setSessionDate}
        sessionLanguage={sessionLanguage}
        onSessionLanguageChange={(language) => {
          setSessionLanguage(language);
          if (language === "mandarin") setPiiMasking(false);
        }}
        remarks={remarks}
        onRemarksChange={setRemarks}
      />
      <AdvancedOptionsForm
        captureMode={captureMode}
        onCaptureModeChange={(mode) => {
          setCaptureMode(mode);
          if (mode === "mic") setSystemAudioConsent(false);
        }}
        isRecording={isRecording}
        sessionLanguage={sessionLanguage}
        piiMasking={piiMasking}
        onPiiMaskingChange={setPiiMasking}
      />
      <PatientConsentForm
        consent={consent}
        onConsentChange={setConsent}
        patientSignature={patientSignature}
        onPatientSignatureChange={setPatientSignature}
        consentDate={consentDate}
        onConsentDateChange={setConsentDate}
        captureMode={captureMode}
        systemAudioConsent={systemAudioConsent}
        onSystemAudioConsentChange={setSystemAudioConsent}
      />
      <AudioRecordingPanel
        waveformRef={waveformRef}
        isRecording={isRecording}
        recordingTime={recordingTime}
        captureMode={captureMode}
        activeSource={activeSource}
        micLevel={micLevel}
        systemLevel={systemLevel}
        isPaused={isPaused}
        isStarting={isStarting}
        consent={consent}
        systemAudioConsent={systemAudioConsent}
        createSessionMutationPending={createSessionMutation.isPending}
        startRecordingMutationPending={startRecordingMutation.isPending}
        sessionStartTime={sessionStartTime}
        sessionLanguage={sessionLanguage}
        fileSizeMb={fileSizeMb}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onPauseRecording={handlePauseRecording}
        onResetRecording={async () => {}}
      />
      <TranscriptPanel
        isRecording={isRecording}
        allowTranscript={allowTranscript}
        onAllowTranscriptChange={setAllowTranscript}
        isTranscriptionConnected={isTranscriptionConnected}
        transcriptionError={transcriptionError}
        transcriptEntries={transcriptEntries}
        currentPartialTranscript={currentPartialTranscript}
      />
      <RecordingWarnings isRecording={isRecording} recordingTime={recordingTime} />
      <RecordingActions
        caseId={caseId!}
        hasRecordedBlob={!!recordedBlobRef.current}
        onSaveSession={handleSaveSession}
        createSessionMutationPending={createSessionMutation.isPending}
        stopRecordingMutationPending={stopRecordingMutation.isPending}
        basePath="/admin/cases"
      />
    </div>
  );
};
