from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.sales import router as sales_router
from app.api.v1.products import router as products_router
from app.api.v1.stores import router as stores_router
from app.api.v1.regions import router as regions_router
from app.api.v1.customers import router as customers_router
from app.api.v1.inventory import router as inventory_router
from app.api.v1.forecast import router as forecast_router
from app.api.v1.anomalies import router as anomalies_router
from app.api.v1.insights import router as insights_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.sql_analytics import router as sql_router
from app.api.v1.export import router as export_router
from app.api.v1.admin import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(sales_router)
api_router.include_router(products_router)
api_router.include_router(stores_router)
api_router.include_router(regions_router)
api_router.include_router(customers_router)
api_router.include_router(inventory_router)
api_router.include_router(forecast_router)
api_router.include_router(anomalies_router)
api_router.include_router(insights_router)
api_router.include_router(datasets_router)
api_router.include_router(sql_router)
api_router.include_router(export_router)
api_router.include_router(admin_router)
