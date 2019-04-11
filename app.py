import datetime
import json
import os
import time

from flask import Flask, jsonify, make_response, render_template, send_from_directory

from models import db, SensorDataModel, SessionModel

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


@app.route('/download', methods=['GET'])
def show_download_page():
    return render_template('download.html')


@app.route('/sessions', methods=['GET'])
def show_session_page():
    return render_template('sessions.html')


@app.route('/api', methods=['GET'])
def show_api_page():
    return render_template('api.html')


@app.route('/about', methods=['GET'])
def show_about_page():
    return render_template('about.html')


@app.route('/api/getLast', methods=['GET'])
def get_data_last():
    results = db.session.query(SensorDataModel)
    return jsonify([i.serialize for i in results
                   .order_by(SensorDataModel.sampleId.desc())
                   .limit(100).all()])


@app.route('/api/get/<int:sid>', methods=['GET'])
def get_data_by_session_id(sid):
    filedir = '/home/gprohorovs/flask-sensor-data-app/download'
    results = retrieve_by_session_id(sid)
    if results.count() > 1000000:
        return jsonify(results=[{"error": "Result set is too large!"}])
    else:
        rows = serialise_dataset(results)
        with open(os.path.join(filedir, 'result.json'), 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/api/download/<int:sid>', methods=['GET'])
def download_data_by_session_id(sid):
    root_dir = os.path.dirname(os.getcwd())
    filename = 'result.json'
    path = os.path.join(root_dir, 'flask-sensor-data-app', 'static', filename)
    results = retrieve_by_session_id(sid)
    if results.count() > 1000000:
        return jsonify(results=[{"error": "Result set is too large! Please provide to and from time!"}])
    else:
        rows = serialise_dataset(results)
        with open(path, 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
    return send_from_directory(os.path.join(root_dir, 'flask-sensor-data-app', 'static'), filename)


@app.route('/api/get/<int:start>/<int:end>/<int:sid>', methods=['GET'])
def get_data_by_time(start, end, sid):
    if end - start <= 0:
        return jsonify(results=[{"error": "Invalid timestamps"}])
    elif end - start > 10800:
        return jsonify(results=[{"error": "Time period is too large"}])
    else:
        tstart = datetime.datetime.fromtimestamp(start)
        tend = datetime.datetime.fromtimestamp(end)
        filedir = '/home/gprohorovs/flask-sensor-data-app/download'

        results = db.session.query(SensorDataModel)\
            .filter(SensorDataModel.sessionId == sid)\
            .filter(SensorDataModel.time >= tstart)\
            .filter(SensorDataModel.time <= tend)
        rows = serialise_dataset(results)
        with open(os.path.join(filedir, 'result.json'), 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/api/download/<int:start>/<int:end>/<int:sid>', methods=['GET'])
def download_data_by_time(start, end, sid):
    if end - start <= 0:
        return jsonify(results=[{"error": "Invalid timestamps"}])
    elif end - start > 10800:
        return jsonify(results=[{"error": "Time period is too large"}])
    else:
        tstart = datetime.datetime.fromtimestamp(start)
        tend = datetime.datetime.fromtimestamp(end)
        root_dir = os.path.dirname(os.getcwd())
        filename = 'result.json'
        path = os.path.join(root_dir, 'flask-sensor-data-app', 'static', filename)

        results = db.session.query(SensorDataModel)\
            .filter(SensorDataModel.sessionId == sid)\
            .filter(SensorDataModel.time >= tstart)\
            .filter(SensorDataModel.time <= tend)
        rows = serialise_dataset(results)

        with open(path, 'w') as fp:
            j = json.dumps(rows, default=converter, indent=4)
            fp.write(j)
        return send_from_directory(os.path.join(root_dir, 'flask-sensor-data-app', 'static'), filename)


@app.route('/api/count/<int:sid>', methods=['GET'])
def count_by_session_id(sid):
    num_rows = db.session.query(SensorDataModel).filter(SensorDataModel.sessionId == sid).count()
    return 'Number of records for session ' + str(sid) + ': ' + str(num_rows)


@app.route('/api/countAll', methods=['GET'])
def count_all():
    num_rows = db.session.query(SensorDataModel).count()
    return 'The total number of rows: ' + str(num_rows)


@app.route('/api/delete/<int:sid>')
def delete_by_session_id(sid):
    num_rows = db.session.query(SensorDataModel) \
        .filter(SensorDataModel.sessionId == sid) \
        .delete()
    db.session.commit()
    return 'Number of records for session ' + str(sid) + ' deleted: ' + str(num_rows)


@app.route('/api/deleteAll')
def delete_all():
    num_rows = db.session.query(SensorDataModel).delete()
    db.session.commit()
    return 'The total number of rows deleted ' + str(num_rows)


@app.route('/api/validate/<int:sid>', methods=['GET'])
def validate_by_session_id(sid):
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


@app.route('/api/getSessions')
def get_sessions():
    results = db.session.query(SessionModel)
    return jsonify([i.serialize for i in results
                   .order_by(SessionModel.sessionId.desc())
                   .limit(100).all()])


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


def retrieve_by_session_id(sid):
    return db.session.query(SensorDataModel) \
        .filter(SensorDataModel.sessionId == sid)


def serialise_dataset(results):
    rows = [i.serialize for i in results
        .order_by(SensorDataModel.sampleId.asc())
        .all()]
    return rows


def validate_dataset(counter, sid):
    errors = []

    for sample in db.session.query(SensorDataModel.sampleId) \
            .filter(SensorDataModel.sessionId == sid) \
            .order_by(SensorDataModel.sampleId.asc()) \
            .all():
        sample_id = int(sample[0])

        if counter != sample_id:
            difference = (sample_id - counter)
            counter = counter + difference
            errors.append('Sequence broken on sample ID '
                          + str(sample_id)
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
