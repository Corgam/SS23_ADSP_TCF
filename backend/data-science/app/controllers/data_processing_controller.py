from flask import request
from flask_restx import Namespace, Resource
from app.services import data_processing_service

api = Namespace('data-processing', description='Data Processing operations')

@api.route('/convert-netcdf-to-json')
class ConvertNetCDFToJSON(Resource):
    def get(self):
        processed_data = data_processing_service.hello_world()
        return processed_data
