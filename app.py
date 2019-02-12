
from flask import Flask, request, jsonify
from models import db, SensorDataModel
import time

app = Flask(__name__)

# Local
POSTGRES = {
    'user': 'gleb',
    'pw': 'primary1',
    'db': 'sensordata',
    'host': 'localhost',
    'port': '5432',
}

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://%(user)s:\
%(pw)s@%(host)s:%(port)s/%(db)s' % POSTGRES

db.init_app(app)


# Home page just prints the message
@app.route('/', methods=['GET'])
def home():
    return 'Successfully deployed!'


# Save endpoint
@app.route('/save', methods=['POST'])
def save():
    req_data = request.get_json()
    message = saveData(req_data)
    return jsonify([{"response": message}])


def saveData(data):
    try:
        db.session.add_all(
            [
                SensorDataModel(record)
                for record in data
            ]
        )
        db.session.commit()
        return "success"
    except Exception as e:
        db.session.rollback()
        return str(e)
    finally:
        db.session.close()


if __name__ == '__main__':
    app.run(debug=True)
