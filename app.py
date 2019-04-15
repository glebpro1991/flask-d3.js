import datetime
import json
import os
import time

from flask import Flask, jsonify, make_response, render_template

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
def get_last():
    results = get_last_sample_batch()
    return jsonify([i.serialize for i in results.all()])


@app.route('/api/get/<int:sid>', methods=['GET'])
def get_by_session_id(sid):
    results = get_samples_by_session_id(sid)
    if results.count() > 1000000:
        return jsonify(results=[{"error": "Result set is too large!"}])
    else:
        with open(get_path(), 'w') as fp:
            j = json.dumps(serialise(results), default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/api/get/<int:start>/<int:end>/<int:sid>', methods=['GET'])
def get_by_time(start, end, sid):
    if end - start <= 0:
        return jsonify(results=[{"error": "Invalid timestamps"}])
    elif end - start > 10800:
        return jsonify(results=[{"error": "Time period is too large"}])
    else:
        results = get_samples_by_time(convert_to_datetime(start), convert_to_datetime(end), sid)
        with open(get_path(), 'w') as fp:
            j = json.dumps(serialise(results), default=converter, indent=4)
            fp.write(j)
        return create_response()


@app.route('/api/count/<int:sid>', methods=['GET'])
def count_by_session_id(sid):
    return str(get_samples_by_session_id(sid).count())


@app.route('/api/validate/<int:sid>', methods=['GET'])
def validate(sid):
    tstart = time.time()
    first = get_first_sample(sid)
    if first is None:
        return 'No records!'
    else:
        response = [
            {'Session': sid},
            {'Time taken': str(time.time() - tstart)},
            {'Errors': validate_dataset(first[0], sid)}]
        return jsonify(results=response)


@app.route('/api/delete/<int:sid>')
def delete_by_session_id(sid):
    num_rows = db.session.query(SensorDataModel) \
        .filter(SensorDataModel.sessionId == sid) \
        .delete()
    db.session.query(SessionModel)\
        .filter(SessionModel.sessionId == sid) \
        .delete()
    db.session.commit()
    return 'Deleted: ' + str(num_rows)


@app.route('/api/countAll', methods=['GET'])
def count_all():
    return str(db.session.query(SensorDataModel).count())


@app.route('/api/deleteAll')
def delete_all():
    num_rows = db.session.query(SensorDataModel).delete()
    db.session.commit()
    return 'Deleted ' + str(num_rows)


@app.route('/api/getSessions')
def get_sessions():
    results = db.session.query(SessionModel)
    return jsonify([i.serialize for i in results
                   .order_by(SessionModel.sessionId.desc())
                   .limit(100).all()])


def converter(o):
    if isinstance(o, datetime.datetime):
        return o.__str__()


def get_samples_by_session_id(sid):
    return db.session.query(SensorDataModel) \
        .filter(SensorDataModel.sessionId == sid) \
        .order_by(SensorDataModel.sampleId.asc())


def get_samples_by_time(tstart, tend, sid):
    return db.session.query(SensorDataModel) \
        .filter(SensorDataModel.sessionId == sid) \
        .filter(SensorDataModel.time >= tstart) \
        .filter(SensorDataModel.time <= tend) \
        .order_by(SensorDataModel.sampleId.asc())


def get_first_sample(sid):
    return db.session.query(SensorDataModel.sampleId) \
        .filter(SensorDataModel.sessionId == sid) \
        .order_by(SensorDataModel.sampleId.asc()) \
        .first()


def get_last_sample_batch():
    return db.session.query(SensorDataModel) \
        .order_by(SensorDataModel.sampleId.desc()) \
        .limit(100)


def convert_to_datetime(timestamp):
    return datetime.datetime.fromtimestamp(timestamp)


def get_path():
    file_dir = '/home/gprohorovs/flask-sensor-data-app/download'
    file_name = 'result.json'
    return os.path.join(file_dir, file_name)


def serialise(results):
    return [i.serialize for i in results]


def validate_dataset(counter, sid):
    errors = []
    for sample in get_samples_by_session_id(sid).all():
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
