import datetime

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class BaseModel(db.Model):
    __abstract__ = True

    def __init__(self, *args):
        super().__init__(*args)

    def __repr__(self):
        return '%s(%s)' % (self.__class__.__name__, {
            column: value
            for column, value in self._to_dict().items()
        })

    def json(self):
        return {
            column: value if not isinstance(value, datetime.date) else value.strftime('%Y-%m-%d')
            for column, value in self._to_dict().items()
        }


class SensorDataModel(BaseModel):
    __tablename__ = 'data'
    sampleId = db.Column(db.BigInteger, primary_key=True, unique=True)
    time = db.Column(db.DateTime)
    accX = db.Column(db.Float)
    accY = db.Column(db.Float)
    accZ = db.Column(db.Float)
    gyroX = db.Column(db.Float)
    gyroY = db.Column(db.Float)
    gyroZ = db.Column(db.Float)
    magX = db.Column(db.Float)
    magY = db.Column(db.Float)
    magZ = db.Column(db.Float)
    sessionId = db.Column(db.BigInteger)

    def __init__(self, data, *args):
        super().__init__(*args)
        self.sampleIdx = data.get('sampleId')
        self.time = datetime.datetime.fromtimestamp(int(data.get('time')) / 1e3)
        self.accX = data.get('accX')
        self.accY = data.get('accY')
        self.accZ = data.get('accZ')
        self.gyroX = data.get('gyroX')
        self.gyroY = data.get('gyroY')
        self.gyroZ = data.get('gyroZ')
        self.magX = data.get('magX')
        self.magY = data.get('magY')
        self.magZ = data.get('magZ')
        self.sessionId = data.get('sessionId')

    @property
    def serialize(self):
        return {
            'sampleId': self.sampleId,
            'time': self.time,
            'accX': self.accX,
            'accY': self.accY,
            'accZ': self.accZ,
            'gyroX': self.gyroX,
            'gyroY': self.gyroY,
            'gyroZ': self.gyroZ,
            'magX': self.magX,
            'magY': self.magY,
            'magZ': self.magZ
        }


class SessionModel(BaseModel):
    __tablename__ = 'session'
    sessionId = db.Column(db.BigInteger, primary_key=True, unique=True)
    userId = db.Column(db.String)
    deviceId = db.Column(db.String)
    startTime = db.Column(db.DateTime)
    stopTime = db.Column(db.DateTime)

    def __init__(self, data, *args):
        super().__init__(*args)
        self.sessionId = data.get('sessionId')
        self.userId = data.get('userId')
        self.deviceId = data.get('deviceId')
        self.startTime = datetime.datetime.fromtimestamp(int(data.get('startTime')) / 1e3)
        self.stopTime = datetime.datetime.fromtimestamp(int(data.get('stopTime')) / 1e3)

    @property
    def serialize(self):
        return {
            'sessionId': self.sessionId,
            'userId': self.userId,
            'deviceId': self.deviceId,
            'startTime': self.startTime,
            'stopTime': self.stopTime
        }
