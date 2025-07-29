import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .schemas import EstimateTimeRequest
from .services import TimeEstimator
import asyncio


@csrf_exempt
def estimate_time_view(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST allowed"}, status=405)

    try:
        body = json.loads(request.body)
        data = EstimateTimeRequest(**body)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

    estimator = TimeEstimator(data.mode)

    async def simulate():
        await asyncio.sleep(0.1)
        return estimator.estimate_time(data.distance_km)

    time_min = asyncio.run(simulate())

    return JsonResponse(
        {
            "estimated_time_minutes": time_min,
            "mode": data.mode,
            "distance_km": data.distance_km,
        }
    )
