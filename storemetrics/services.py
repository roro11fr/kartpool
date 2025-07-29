class TimeEstimator:
    SPEEDS = {"walk": 5.0, "bike": 15.0}  # km/h  # km/h

    def __init__(self, mode: str):
        self.mode = mode

    def estimate_time(self, distance_km: float) -> float:
        speed = self.SPEEDS.get(self.mode, 5.0)
        time_hours = distance_km / speed
        return round(time_hours * 60, 2)  # returnează minute
