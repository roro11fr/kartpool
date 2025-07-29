from django.test import TestCase, Client
import json


class EstimateTimeTest(TestCase):
    def test_estimate_time_valid(self):
        client = Client()
        payload = {"distance_km": 2.0, "mode": "walk"}
        response = client.post(
            "/api/storemetrics/estimate-time/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        print("Status:", response.status_code)
        print("Content:", response.content.decode())  # <- important!

        self.assertEqual(response.status_code, 200)
        self.assertIn("estimated_time_minutes", response.json())
