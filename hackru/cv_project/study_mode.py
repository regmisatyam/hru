# Study Mode - Focus Detection with Mock Data
# This version uses mock data for testing

import cv2
import mediapipe as mp
import numpy as np
from ultralytics import YOLO
import time
import json
import torch
import random
import os

# Initialize Mediapipe
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=False,
    refine_landmarks=True,
    max_num_faces=2,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# Initialize YOLO Model
try:
    from ultralytics.nn.tasks import DetectionModel
    torch.serialization.add_safe_globals([DetectionModel])
except Exception as e:
    print(f"Warning: {e}")

model_path = 'yolov5su.pt' if os.path.exists('yolov5su.pt') else 'yolov5s.pt'
try:
    model = YOLO(model_path)
except Exception as e:
    print(f"Warning: {e}")
    model = None

# Global Session State
focus_scores = []
cheat_times = []
cheat_event = []

blink_counter = 0
phone_checks = 0
face_events = 0
turn_events = 0
down_events = 0

phone_flag = False
face_flag = False
turn_flag = False
down_flag = False
no_face_flag = False
eyes_closed_flag = False

current_state = "focused"
state_start_time = time.time()
focus_duration = 0.0
distraction_duration = 0.0
cheat_duration = 0.0
last_frame_time = time.time()
start_time = time.time()
SESSION_DURATION = 30

# Event type constants
EVENT_LOOKING_DOWN = 1
EVENT_HEAD_TURNED = 2
EVENT_MULTIPLE_FACES = 3
EVENT_PHONE_DETECTED = 4
EVENT_NO_FACE = 5
EVENT_EYES_CLOSED = 6

USE_MOCK_DATA = True

def set_session_duration(seconds): 
    global SESSION_DURATION, start_time, state_start_time, last_frame_time
    global focus_duration, distraction_duration, cheat_duration
    global current_state, focus_scores, cheat_times, cheat_event
    
    SESSION_DURATION = seconds
    start_time = time.time()
    state_start_time = time.time()
    last_frame_time = time.time()
    focus_duration = 0.0
    distraction_duration = 0.0
    cheat_duration = 0.0
    current_state = "focused"
    focus_scores = []
    cheat_times = []
    cheat_event = []

def generate_mock_focus_score():
    if random.random() < 0.70:
        return random.randint(70, 95)
    elif random.random() < 0.85:
        return random.randint(40, 69)
    else:
        return random.randint(20, 45)

def update_state_tracking(new_state):
    global current_state, state_start_time, focus_duration, distraction_duration, cheat_duration
    global last_frame_time
    
    current_time = time.time()
    time_in_state = current_time - state_start_time
    
    if new_state != current_state:
        if current_state == "focused":
            focus_duration += time_in_state
        elif current_state == "distracted":
            distraction_duration += time_in_state
        elif current_state == "cheating":
            cheat_duration += time_in_state
        
        current_state = new_state
        state_start_time = current_time
    
    last_frame_time = current_time

def get_distraction_description(event_type):
    descriptions = {
        EVENT_LOOKING_DOWN: "Looking Down",
        EVENT_HEAD_TURNED: "Head Turned Away",
        EVENT_MULTIPLE_FACES: "Multiple Faces Detected",
        EVENT_PHONE_DETECTED: "Phone Detected",
        EVENT_NO_FACE: "No Face Detected",
        EVENT_EYES_CLOSED: "Eyes Closed"
    }
    return descriptions.get(event_type, "Unknown Distraction")

def process_frame(frame, timestamp=None):
    global focus_scores, cheat_times, cheat_event
    global current_state, focus_duration, distraction_duration, cheat_duration

    if timestamp is None:
        timestamp = time.time() - start_time
    
    if timestamp > SESSION_DURATION:
        update_state_tracking(current_state)
        return json.dumps({
            "status": "Session Ended",
            "focus_time": round(focus_duration, 2),
            "distraction_time": round(distraction_duration, 2),
            "cheat_time": round(cheat_duration, 2),
            "total_time": round(timestamp, 2)
        })

    score = generate_mock_focus_score()
    
    if score >= 70:
        status = "Focused"
        new_state = "focused"
    elif score >= 40:
        status = "Slightly Distracted"
        new_state = "distracted"
    else:
        status = "Distracted"
        new_state = "distracted"
    
    if random.random() < 0.03 and len(cheat_event) < 10:
        event_type = random.choice([
            EVENT_LOOKING_DOWN,
            EVENT_HEAD_TURNED,
            EVENT_PHONE_DETECTED,
            EVENT_MULTIPLE_FACES
        ])
        
        cheat_times.append(timestamp)
        cheat_event.append(event_type)
        score = 0
        new_state = "cheating"
        status = get_distraction_description(event_type)
    
    update_state_tracking(new_state)
    
    if score > 0:
        focus_scores.append(score)

    return json.dumps({
        "score": score,
        "status": status,
        "state": new_state,
        "timestamp": round(timestamp, 2),
        "focus_time": round(focus_duration, 2),
        "distraction_time": round(distraction_duration, 2),
        "cheat_time": round(cheat_duration, 2),
        "cheat_count": len(cheat_event),
        "phone_detections": cheat_event.count(EVENT_PHONE_DETECTED),
        "multiple_face_events": cheat_event.count(EVENT_MULTIPLE_FACES),
        "head_turn_events": cheat_event.count(EVENT_HEAD_TURNED),
        "looking_down_events": cheat_event.count(EVENT_LOOKING_DOWN),
        "mock_data": USE_MOCK_DATA
    })

def get_session_duration(): 
    global SESSION_DURATION
    return SESSION_DURATION 

def get_focus_data(): 
    global focus_scores
    return focus_scores

def get_cheat_data(): 
    global cheat_times, cheat_event
    return cheat_times, cheat_event

def get_time_metrics():
    global current_state, state_start_time, focus_duration, distraction_duration, cheat_duration
    
    current_time = time.time()
    time_in_current_state = current_time - state_start_time
    
    if current_state == "focused":
        final_focus = focus_duration + time_in_current_state
        final_distraction = distraction_duration
        final_cheat = cheat_duration
    elif current_state == "distracted":
        final_focus = focus_duration
        final_distraction = distraction_duration + time_in_current_state
        final_cheat = cheat_duration
    elif current_state == "cheating":
        final_focus = focus_duration
        final_distraction = distraction_duration
        final_cheat = cheat_duration + time_in_current_state
    else:
        final_focus = focus_duration
        final_distraction = distraction_duration
        final_cheat = cheat_duration
    
    total_time = current_time - start_time
    
    return {
        "focus_time": round(final_focus, 2),
        "distraction_time": round(final_distraction, 2),
        "cheat_time": round(final_cheat, 2),
        "total_time": round(total_time, 2),
        "focus_percentage": round((final_focus / total_time * 100) if total_time > 0 else 0, 1),
        "distraction_percentage": round((final_distraction / total_time * 100) if total_time > 0 else 0, 1),
        "cheat_percentage": round((final_cheat / total_time * 100) if total_time > 0 else 0, 1),
        "phone_detections": cheat_event.count(EVENT_PHONE_DETECTED),
        "multiple_face_events": cheat_event.count(EVENT_MULTIPLE_FACES),
        "head_turn_events": cheat_event.count(EVENT_HEAD_TURNED),
        "looking_down_events": cheat_event.count(EVENT_LOOKING_DOWN),
        "total_cheat_events": len(cheat_event),
        "avg_focus_score": round(sum(focus_scores) / len(focus_scores), 1) if focus_scores else 0,
        "mock_data": USE_MOCK_DATA
    }

def reset_session():
    global focus_scores, cheat_times, cheat_event
    global blink_counter, phone_checks, face_events, turn_events, down_events
    global phone_flag, face_flag, turn_flag, down_flag, no_face_flag, eyes_closed_flag
    global current_state, state_start_time, focus_duration, distraction_duration, cheat_duration
    global start_time, last_frame_time
    
    focus_scores = []
    cheat_times = []
    cheat_event = []
    blink_counter = 0
    phone_checks = 0
    face_events = 0
    turn_events = 0
    down_events = 0
    
    phone_flag = False
    face_flag = False
    turn_flag = False
    down_flag = False
    no_face_flag = False
    eyes_closed_flag = False
    
    current_state = "focused"
    focus_duration = 0.0
    distraction_duration = 0.0
    cheat_duration = 0.0
    start_time = time.time()
    state_start_time = time.time()
    last_frame_time = time.time()

print("MOCK DATA MODE - Focus scores will be randomly generated")
