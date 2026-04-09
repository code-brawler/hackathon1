import speech_recognition as sr
import os
import urllib.request

urllib.request.urlretrieve("https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3", "test2.mp3") 
# wait, speech_recognition doesn't support mp3! Need WAV.
# Just use the previous test_wav.js output!
