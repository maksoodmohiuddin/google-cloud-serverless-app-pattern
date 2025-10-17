import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from google.oauth2 import service_account

app = Flask(__name__)
CORS(app)

import os

# Get project ID from environment variable
project_id = os.environ.get('GOOGLE_CLOUD_PROJECT', 'your-project-id')
client = firestore.Client(project=project_id)
employees_app_ref = client.collection('employees_app').document('employees')
employees_ref = employees_app_ref.collection('info')


@app.route('/employees', methods=['GET'])
def get_employees():
    """
            get_employees() : Fetches documents from Firestore collection as JSON
            employee : Return document that matches query ID
            all_employees : Return all documents
        """
    try:
        # Check if ID was passed to URL query
        employee_id = request.args.get('id')
        if employee_id:
            employee = employees_ref.document(employee_id).get()
            return jsonify(employee.to_dict()), 200
        else:
            all_employees = [doc.to_dict() for doc in employees_ref.stream()]
            return jsonify(all_employees), 200
    except Exception as e:
        # Log error properly instead of exposing it to client
        print(f"Error fetching employees: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/employee', methods=['POST', 'PUT'])
def add_update_employee():
    json_ = request.get_json()
    
    # Input validation
    if not json_:
        return jsonify({"error": "Request body is required"}), 400
    
    if 'id' not in json_:
        return jsonify({"error": "Employee ID is required"}), 400
    
    # Validate required fields
    required_fields = ['firstName', 'lastName']
    for field in required_fields:
        if field not in json_ or not json_[field]:
            return jsonify({"error": f"{field} is required"}), 400

    doc_ref = employees_ref.document(u'{}'.format(json_.get('id')))
    try:
        doc_ref.set(json_)
        response = 'Employee Added or Updated'
        return jsonify(response), 201
    except (RuntimeError, TypeError, NameError) as e:
        print(f"Error adding/updating employee: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


# Removed duplicate endpoint - use /employee instead


@app.route('/employee', methods=['DELETE'])
def delete_employee():
    employee_id = request.args.get('id')
    if employee_id:
        try:
            employee = employees_ref.document(employee_id).delete()
            response = 'Employee Deleted!'
            return jsonify(response), 201
        except (RuntimeError, TypeError, NameError) as e:
            print(f"Error deleting employee: {str(e)}")
            return jsonify({"error": "Internal server error"}), 500
    else:
        return 'Precondition Failed', 412


if __name__ == '__main__':
    # Disable debug mode in production
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(debug=debug_mode, host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
