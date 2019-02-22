import datetime
import json
import os
import time

from flask import Flask, jsonify, make_response

from models import db, SensorDataModel

app = Flask(__name__)

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


@app.route('/', methods=['GET'])
def home():
    return 'Successfully deployed!'


@app.route('/getLastBatch', methods=['GET'])
def getLastBatch():
    results = db.session.query(SensorDataModel)
    return jsonify([i.serialize for i in results
                   .order_by(SensorDataModel.sampleId.desc())
                   .limit(100).all()])


@app.route('/get/<int:start>/<int:end>', methods=['GET'])
def get(start, end):
    if end - start <= 0:
        response = [
            {"error": "Invalid timestamps"}
        ]
        return jsonify(results=response)
    elif end - start > 10800:
        response = [
            {"error": "Time period is too large"}
        ]
        return jsonify(results=response)
    else:
        tstart = datetime.datetime.fromtimestamp(start)
        tend = datetime.datetime.fromtimestamp(end)
        filedir = '/home/gprohorovs/flask-sensor-data-app/download'

        results = db.session.query(SensorDataModel)
        rows = [i.serialize for i in results
            .order_by(SensorDataModel.sampleId.asc())
            .filter(SensorDataModel.time >= tstart)
            .filter(SensorDataModel.time <= tend)
            .all()]

        with open(os.path.join(filedir, 'result.json'), 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/count', methods=['GET'])
def count():
    numRows = db.session.query(SensorDataModel).count()
    return 'The total number of rows in the table is ' + str(numRows)


@app.route('/validate', methods=['GET'])
def validate():
    tstart = time.time()
    errors = []
    counter = db.session.query(SensorDataModel.sampleId)\
        .order_by(SensorDataModel.sampleId.asc())\
        .first()[0]

    for sample in db.session.query(SensorDataModel.sampleId)\
            .order_by(SensorDataModel.sampleId.asc())\
            .all():
        sampleId = int(sample[0])

        if counter != sampleId:
            difference = (sampleId - counter)
            counter = counter + difference
            errors.append('Sequence broken on sample ID '
                          + str(sampleId)
                          + '. ' + str(difference)
                          + ' rows are missing!')
        counter = counter + 1

    response = [
        {'time taken': str(time.time() - tstart)},
        {'errors': errors}
    ]
    return jsonify(results=response)


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


def create_response():
    response = make_response()
    response.headers['Content-Description'] = 'File Transfer'
    response.headers['Cache-Control'] = 'no-cache'
    response.headers['Content-Type'] = 'application/octet-stream'
    response.headers['Content-Disposition'] = 'attachment; filename=%s' % 'result.json'
    response.headers['Content-Length'] = os.path.getsize('/home/gprohorovs/flask-sensor-data-app/download/result.json')
    response.headers['X-Accel-Redirect'] = '/download/result.json'
    return response


if __name__ == '__main__':
    app.run(debug=True)
