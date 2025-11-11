import requests

# Base URL of your backend
BASE_URL = "http://localhost:3000/users"  # Change to your actual URL if different

# Generate 10 test users
users = []
for i in range(1, 11):
    user = {
        "name": f"Test{i}",
        "email": f"test{i}@test.com",
        "password": "testpass",
        "usn": f"1AB23CS{i:03d}"
    }
    users.append(user)

# Post each user to /register
for user in users:
    try:
        response = requests.post(f"{BASE_URL}/register", json=user)
        if response.status_code == 200 or response.status_code == 201:
            print(f"User {user['name']} created successfully!")
        else:
            print(f"Failed to create {user['name']}: {response.json()}")
    except Exception as e:
        print(f"Error creating {user['name']}: {e}")
