from pydantic import BaseModel, constr


class EstimateTimeRequest(BaseModel):
    distance_km: float
    mode: "constr(to_lower=True, pattern='^(walk|bike)$')"  # noqa: F722
