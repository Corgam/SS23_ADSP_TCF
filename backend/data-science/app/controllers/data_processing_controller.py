from flask import request, Response, stream_with_context
from flask_restx import Namespace, Resource
from app.services import data_processing_service
from werkzeug.datastructures import FileStorage
from app.errors import FailedToParseError

api = Namespace('convert-netcdf-to-json', description='Data Processing operations')

upload_parser = api.parser()
upload_parser.add_argument('file', type=FileStorage, location='files', required=True)

@api.route('/metadata')
@api.expect(upload_parser)
class ConvertNetCDFMetadataToJSON(Resource):
    @api.response(200, 'Success')
    @api.response(400, 'Bad Request')
    def post(self):
        """
        Uploads a NetCDF file and converts its metadata to JSON.
        """
        args = upload_parser.parse_args()
        netCDF4_file = args['file']

        try:
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_netcdf_metadata_to_json(netCDF4_file)
            return Response(
                stream_with_context(json_generator),
                mimetype='application/json'
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")

upload_parser2 = api.parser()
upload_parser2.add_argument('file', type=FileStorage, location='files', required=True)
upload_parser2.add_argument('filter_variables', type=str, location='form', required=False)
upload_parser2.add_argument('isCERv2', type=str, location='form', required=False)
upload_parser2.add_argument('step_size', type=str, location='form', required=True)

@api.route('/data')
@api.expect(upload_parser2)
class ConvertNetCDFDataToJSON(Resource):
    @api.response(200, 'Success')
    @api.response(400, 'Bad Request')
    def post(self):
        """
        Uploads a NetCDF file and converts its data to JSON.
        """
        args = upload_parser2.parse_args()
        netCDF4_file = args['file']
        filter = args.get('filter_variables').split(',') if args.get('filter_variables') else None
        is_CERv2 = args.get('isCERv2', False)
        step_size = int(args.get('step_size')) if args.get('step_size') else 1

        try:
            # TODO: validate the file before sending response
            json_generator = data_processing_service.convert_netcdf_data_to_json(
                netCDF4_file,
                filter,
                is_CERv2,
                step_size
            )
            return Response(
                stream_with_context(json_generator),
                mimetype='application/json'
            )
        except Exception as e:
            raise FailedToParseError("Failed to parse provided NetCDF file.")
