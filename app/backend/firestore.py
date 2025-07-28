import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from google.oauth2 import service_account

app = Flask(__name__)
CORS(app)

client = firestore.Client(project="PLEASE_UPDATE_PROJECT_ID")
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
            # Validate and sanitize the employee ID
            if not isinstance(employee_id, str):
                return jsonify({'error': 'Invalid employee ID'}), 400
            
            # Sanitize the ID to prevent injection attacks
            import re
            if not re.match(r'^[a-zA-Z0-9_-]+$', employee_id):
                return jsonify({'error': 'Invalid employee ID format'}), 400
            
            employee = employees_ref.document(employee_id).get()
            if not employee.exists:
                return jsonify({'error': 'Employee not found'}), 404
            return jsonify(employee.to_dict()), 200
        else:
            all_employees = [doc.to_dict() for doc in employees_ref.stream()]
            return jsonify(all_employees), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/employee', methods=['POST', 'PUT'])
def add_update_employee():
    json_ = request.get_json()
    if 'id' not in json_:
        return 'Precondition Failed', 412

    # Validate and sanitize the employee ID
    employee_id = json_.get('id')
    if not employee_id or not isinstance(employee_id, str):
        return 'Invalid employee ID', 400
    
    # Sanitize the ID to prevent injection attacks
    import re
    if not re.match(r'^[a-zA-Z0-9_-]+$', employee_id):
        return 'Invalid employee ID format', 400

    doc_ref = employees_ref.document(employee_id)
    try:
        doc_ref.set(json_)
        response = 'Employee Added or Updated'
        return jsonify(response), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/employeesecure', methods=['POST', 'PUT'])
def add_update_employee_secure():
    json_ = request.get_json()
    if 'id' not in json_:
        return 'Precondition Failed', 412

    # Validate and sanitize the employee ID
    employee_id = json_.get('id')
    if not employee_id or not isinstance(employee_id, str):
        return 'Invalid employee ID', 400
    
    # Sanitize the ID to prevent injection attacks
    import re
    if not re.match(r'^[a-zA-Z0-9_-]+$', employee_id):
        return 'Invalid employee ID format', 400

    try:
        doc_ref = employees_ref.document(employee_id)
        doc_ref.set(json_)
        response = 'Employee Added or Updated'
        return jsonify(response), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/employee', methods=['DELETE'])
def delete_employee():
    employee_id = request.args.get('id')
    if not employee_id:
        return 'Precondition Failed', 412
    
    # Validate and sanitize the employee ID
    if not isinstance(employee_id, str):
        return 'Invalid employee ID', 400
    
    # Sanitize the ID to prevent injection attacks
    import re
    if not re.match(r'^[a-zA-Z0-9_-]+$', employee_id):
        return 'Invalid employee ID format', 400
    
    try:
        employees_ref.document(employee_id).delete()
        response = 'Employee Deleted!'
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
