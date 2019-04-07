import datetime
import json
import os
import time

from flask import Flask, jsonify, make_response, render_template

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


@app.route('/api/getLast', methods=['GET'])
def get_last():
    results = db.session.query(SensorDataModel)
    return jsonify([i.serialize for i in results
                   .order_by(SensorDataModel.sampleId.desc())
                   .limit(100).all()])


@app.route('/api/get/<int:start>/<int:end>/<int:sid>', methods=['GET'])
def get_by_time(start, end, sid):
    if end - start <= 0:
        return jsonify(results=[{"error": "Invalid timestamps"}])
    elif end - start > 10800:
        return jsonify(results=[{"error": "Time period is too large"}])
    else:
        tstart = datetime.datetime.fromtimestamp(start)
        tend = datetime.datetime.fromtimestamp(end)
        filedir = '/home/gprohorovs/flask-sensor-data-app/download'

        results = db.session.query(SensorDataModel) \
            .filter(SensorDataModel.sessionId == sid)
        rows = [i.serialize for i in results
            .order_by(SensorDataModel.sampleId.asc())
            .filter(SensorDataModel.time >= tstart)
            .filter(SensorDataModel.time <= tend)
            .all()]

        with open(os.path.join(filedir, 'result.json'), 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/api/get/<int:sid>', methods=['GET'])
def get(sid):
    filedir = '/home/gprohorovs/flask-sensor-data-app/download'

    results = db.session.query(SensorDataModel).filter(SensorDataModel.sessionId == sid)

    if results.count() > 1000000:
        return jsonify(results=[{"error": "Result set is too large!"}])
    else:
        rows = [i.serialize for i in results
            .order_by(SensorDataModel.sampleId.asc())
            .filter(SensorDataModel.sessionId == sid)
            .all()]
        with open(os.path.join(filedir, 'result.json'), 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/api/count/<int:sid>', methods=['GET'])
def count(sid):
    num_rows = db.session.query(SensorDataModel).filter(SensorDataModel.sessionId == sid).count()
    return jsonify(results=[{'result': 'Number of records for session ' + str(sid) + ': ' + str(num_rows)}])


@app.route('/api/countAll', methods=['GET'])
def count_all():
    num_rows = db.session.query(SensorDataModel).count()
    return jsonify(results=[{'The total number of rows: ' + str(num_rows)}])


@app.route('/api/delete/<int:sid>')
def delete(sid):
    num_rows = db.session.query(SensorDataModel) \
        .filter(SensorDataModel.sessionId == sid) \
        .delete()
    db.session.commit()
    return jsonify(results=[{'Number of records for session ' + str(sid) + ' deleted: ' + str(num_rows)}])


@app.route('/api/deleteAll')
def delete_all():
    num_rows = db.session.query(SensorDataModel).delete()
    db.session.commit()
    return jsonify(results=[{'The total number of rows deleted ' + str(num_rows)}])


@app.route('/api/validate/<int:sid>', methods=['GET'])
def validate(sid):
    tstart = time.time()

    first = db.session.query(SensorDataModel.sampleId) \
        .filter(SensorDataModel.sessionId == sid) \
        .order_by(SensorDataModel.sampleId.asc()) \
        .first()

    if first is None:
        return 'No records in the table'
    else:
        response = [
            {'time taken': str(time.time() - tstart)},
            {'errors': validate_dataset(first[0], sid)}]
        return jsonify(results=response)


@app.route('/download', methods=['GET'])
def download_page():
    return render_template('download.html')


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


def validate_dataset(counter, sid):
    errors = []

    for sample in db.session.query(SensorDataModel.sampleId) \
            .filter(SensorDataModel.sessionId == sid) \
            .order_by(SensorDataModel.sampleId.asc()) \
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

    return errors


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
