import os
import re
import logging
import html
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import firestore
from google.oauth2 import service_account
from werkzeug.exceptions import BadRequest

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = firestore.Client(project="PLEASE_UPDATE_PROJECT_ID")
employees_app_ref = client.collection('employees_app').document('employees')
employees_ref = employees_app_ref.collection('info')

# Input validation constants
MAX_STRING_LENGTH = 255
MAX_YEARS_EXPERIENCE = 50
VALID_JOB_TITLES = [
    'Analyst', 'Associate Partner', 'Client Delivery Lead', 'Cloud Architect',
    'Cloud Engineer', 'Partner', 'Program Manager', 'Project Manager',
    'Senior Cloud Architect', 'Senior Cloud Engineer', 'Senior Partner',
    'Senior Project Manager', 'TBD'
]

def validate_employee_id(employee_id):
    """Validate and sanitize employee ID"""
    if not employee_id:
        raise ValueError("Employee ID is required")
    
    if not isinstance(employee_id, str):
        raise ValueError("Employee ID must be a string")
    
    # Check for control characters and newlines before stripping
    if any(ord(c) < 32 for c in employee_id):
        raise ValueError("Employee ID contains invalid control characters")
    
    # Remove any whitespace
    employee_id = employee_id.strip()
    
    # Check length
    if len(employee_id) == 0 or len(employee_id) > 50:
        raise ValueError("Employee ID must be between 1 and 50 characters")
    
    # Allow only alphanumeric characters, hyphens, and underscores
    if not re.match(r'^[a-zA-Z0-9_-]+$', employee_id):
        raise ValueError("Employee ID contains invalid characters")
    
    return employee_id

def validate_employee_data(data):
    """Validate employee data structure and content"""
    if not isinstance(data, dict):
        raise ValueError("Employee data must be a JSON object")
    
    # Validate required ID field
    if 'id' not in data:
        raise ValueError("Employee ID is required")
    
    # Validate ID
    data['id'] = validate_employee_id(data['id'])
    
    # Validate optional string fields
    string_fields = ['firstName', 'lastName', 'avatarURL', 'imageURL', 'displayName', 'email']
    for field in string_fields:
        if field in data:
            if not isinstance(data[field], str):
                raise ValueError(f"{field} must be a string")
            
            # Check for control characters
            if any(ord(c) < 32 for c in data[field]):
                raise ValueError(f"{field} contains invalid control characters")
            
            # Sanitize HTML and strip whitespace
            data[field] = html.escape(data[field]).strip()
            
            if len(data[field]) > MAX_STRING_LENGTH:
                raise ValueError(f"{field} exceeds maximum length of {MAX_STRING_LENGTH} characters")
    
    # Validate email format if provided
    if 'email' in data and data['email']:
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            raise ValueError("Invalid email format")
    
    # Validate job title
    if 'jobTitle' in data and data['jobTitle'] is not None:
        if not isinstance(data['jobTitle'], str):
            raise ValueError("Job title must be a string")
        if data['jobTitle'] not in VALID_JOB_TITLES:
            raise ValueError(f"Invalid job title. Must be one of: {', '.join(VALID_JOB_TITLES)}")
    
    # Validate years of experience
    if 'yearsExperience' in data and data['yearsExperience'] is not None:
        if not isinstance(data['yearsExperience'], (int, float)):
            raise ValueError("Years of experience must be a number")
        if data['yearsExperience'] < 0 or data['yearsExperience'] > MAX_YEARS_EXPERIENCE:
            raise ValueError(f"Years of experience must be between 0 and {MAX_YEARS_EXPERIENCE}")
        data['yearsExperience'] = int(data['yearsExperience'])
    
    # Validate address if provided
    if 'address' in data and data['address'] is not None:
        if not isinstance(data['address'], dict):
            raise ValueError("Address must be an object")
        
        address = data['address']
        if 'city' in address:
            if not isinstance(address['city'], str):
                raise ValueError("Address city must be a string")
            # Check for control characters
            if any(ord(c) < 32 for c in address['city']):
                raise ValueError("Address city contains invalid control characters")
            # Sanitize HTML and strip whitespace
            address['city'] = html.escape(address['city']).strip()
            if len(address['city']) > MAX_STRING_LENGTH:
                raise ValueError(f"Address city exceeds maximum length of {MAX_STRING_LENGTH} characters")
        
        if 'street' in address:
            if not isinstance(address['street'], str):
                raise ValueError("Address street must be a string")
            # Check for control characters
            if any(ord(c) < 32 for c in address['street']):
                raise ValueError("Address street contains invalid control characters")
            # Sanitize HTML and strip whitespace
            address['street'] = html.escape(address['street']).strip()
            if len(address['street']) > MAX_STRING_LENGTH:
                raise ValueError(f"Address street exceeds maximum length of {MAX_STRING_LENGTH} characters")
    
    # Validate boolean fields
    boolean_fields = ['authenticated']
    for field in boolean_fields:
        if field in data and data[field] is not None:
            if not isinstance(data[field], bool):
                raise ValueError(f"{field} must be a boolean")
    
    return data

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
            # Validate employee ID
            try:
                validated_id = validate_employee_id(employee_id)
            except ValueError as e:
                logger.warning(f"Invalid employee ID provided: {employee_id}")
                return jsonify({"error": str(e)}), 400
            
            # Fetch specific employee
            employee_doc = employees_ref.document(validated_id).get()
            
            if not employee_doc.exists:
                return jsonify({"error": "Employee not found"}), 404
                
            return jsonify(employee_doc.to_dict()), 200
        else:
            # Fetch all employees
            all_employees = [doc.to_dict() for doc in employees_ref.stream()]
            return jsonify(all_employees), 200
            
    except Exception as e:
        logger.error(f"Error in get_employees: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/employee', methods=['POST', 'PUT'])
def add_update_employee():
    """Add or update employee with comprehensive validation"""
    try:
        # Get JSON data
        json_data = request.get_json()
        
        if not json_data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        # Validate employee data
        try:
            validated_data = validate_employee_data(json_data)
        except ValueError as e:
            logger.warning(f"Invalid employee data: {str(e)}")
            return jsonify({"error": str(e)}), 400
        
        # Save to Firestore
        doc_ref = employees_ref.document(validated_data['id'])
        doc_ref.set(validated_data)
        
        logger.info(f"Employee {validated_data['id']} added/updated successfully")
        return jsonify({"message": "Employee added or updated successfully"}), 201
        
    except Exception as e:
        logger.error(f"Error in add_update_employee: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/employeesecure', methods=['POST', 'PUT'])
def add_update_employee_secure():
    """Secure endpoint for adding/updating employees (same validation as regular endpoint)"""
    return add_update_employee()

@app.route('/employee', methods=['DELETE'])
def delete_employee():
    """Delete employee with proper validation"""
    try:
        employee_id = request.args.get('id')
        
        if not employee_id:
            return jsonify({"error": "Employee ID is required"}), 400
        
        # Validate employee ID
        try:
            validated_id = validate_employee_id(employee_id)
        except ValueError as e:
            logger.warning(f"Invalid employee ID for deletion: {employee_id}")
            return jsonify({"error": str(e)}), 400
        
        # Check if employee exists before deletion
        employee_doc = employees_ref.document(validated_id).get()
        if not employee_doc.exists:
            return jsonify({"error": "Employee not found"}), 404
        
        # Delete employee
        employees_ref.document(validated_id).delete()
        
        logger.info(f"Employee {validated_id} deleted successfully")
        return jsonify({"message": "Employee deleted successfully"}), 200
        
    except Exception as e:
        logger.error(f"Error in delete_employee: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Bad request"}), 400

@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=int(os.environ.get('PORT', 80)))
