import json
import pprint

file_directory = '/Users/apple/Desktop/sensor-data.json'

with open(file_directory) as json_data:
    json_string = json_data.read()
    data = json.loads(json_string)  # produces dictionary


# check every batch is ordered sequentially
def isConsistentCollection():
    counter = 0

    for i, key in enumerate(data):
        if counter != int(key):
            # raise Exception('Sequence is broken with batch ID ' + batchId)
            print("Sequence broken. Expected: " + str(counter) + " Actual: " + key)
            difference = int(key) - counter
            print(str(difference) + " records are missing")
            counter = counter + difference
        counter = counter + 1

    print("Batch is ordered sequentially. No records are missing.")


# check that 1) each batch has 100 samples and 2) samples are consistent with batch ID
def isValidBatch():
    for key in data:
        item = data[key]
        if len(item) != 100:
            raise Exception('Batch does not contain 100 records. It only contains ' + len(item) + ' elements')
        for i, item in enumerate(item):
            index = str(i)
            id1 = item['sampleId']
            if len(index) == 1:
                id2 = str(key) + '0' + index
            else:
                id2 = str(key) + index

            if int(id1) != int(id2):
                raise Exception('Inconsistencies in sample IDs: ' + str(id1) + ' ' + str(id2))
    print("Samples are consistent with the batch. No inconsistencies found")


# get the first and last timestamps
def checkTimestamps():
    datalist = list(enumerate(data))
    size = len(datalist)
    print(size)
    firstTime = data[datalist[0][1]][0]['timestamp']
    lastTime = data[datalist[size-1][1]][0]['timestamp']
    millis = lastTime - firstTime
    print("The ID of the last element %s" % datalist[size-1][1])
    print("Total time in ms is %d" % millis)

    seconds = (millis/1000) % 60
    minutes = (millis/(1000*60)) % 60
    hours = (millis/(1000*60*60)) % 24

    print("The dataset took %d hours and %d minutes and %d seconds to gather" % (hours, minutes, seconds))


# isConsistentCollection()
# isValidBatch()
checkTimestamps()


