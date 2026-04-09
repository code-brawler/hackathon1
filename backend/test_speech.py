import speech_recognition as sr
import os
import urllib.request

# Download a sample 16kHz speech file instead of silence to see if recognize_google works
urllib.request.urlretrieve("https://www2.cs.uic.edu/~i101/SoundFiles/preamble10.wav", "test_speech.wav")

recognizer = sr.Recognizer()
with sr.AudioFile("test_speech.wav") as source:
    audio = recognizer.record(source)

try:
    print("Transcribing...")
    transcript = recognizer.recognize_google(audio)
    print("Result:", transcript)
except Exception as e:
    print("Error:", e)
