import requests
import random
from datetime import datetime, timedelta

BASE_URL = "http://localhost:3000/users/attendance-upload"
SUBJECT = "HTML,CSS,JS,NODE,REACT,MERN,PYTHON"

students = [
    "1AB23CS001", "1AB23CS002", "1AB23CS003", "1AB23CS004", "1AB23CS005",
    "1AB23CS006", "1AB23CS007", "1AB23CS008", "1AB23CS009", "1AB23CS010"
]

start_date = datetime(2025, 10, 1)
days = 30

for day in range(days):
    date = (start_date + timedelta(days=day)).strftime("%Y-%m-%d")

    attendance_list = []
    for usn in students:
        status = random.choice(["P", "A"])
        attendance_list.append({"USN": usn, "Status": status})

    payload = {
        "subject":random.choice(SUBJECT.split(",")),
        "attendance": attendance_list
    }

    print(f"\n📅 Day {day+1} ({date}) - Sending attendance for {SUBJECT}")

    try:
        response = requests.post(BASE_URL, json=payload)
        if response.status_code == 200:
            print(f"✅ Attendance uploaded for {date}")
        else:
            print(f"❌ Error: {response.text}")
    except Exception as e:
        print(f"⚠️ Connection error: {e}")
