#!/usr/bin/python -tt
import sys, pymongo, os, glob, re, bson.json_util, json, time, datetime

from bson.objectid import ObjectId

from pymongo import MongoClient

from bson.dbref import DBRef

from bson.json_util import dumps

import string, tangelo

client = MongoClient('fr-s-ivg-mdb.ncifcrf.gov', 29020);

#client = MongoClient()

class DynamicObject:
     pass
i = 0;

def run(subGraph=None, subName=None, keyword=None, value=None):
	response = {}
	item = json.loads(subGraph);
	
	try:
		db = client["saveState"]
		t = str(time.time())
		collection = db[t]
		for row in item:
			full_id = collection.insert(row)
		ref = DynamicObject()
		setattr(ref, "collection", t)
		setattr(ref, "name", subName)
		setattr(ref, "keyword", keyword)
		setattr(ref, "value", value)
		collection = db["files"]
		item_id = collection.insert(ref.__dict__)
		response['status'] = "OK"
	except ValueError:
		response['error'] = "Could not convert to JSON"
		return bson.json_util.dumps(response)
	client.close()
	tangelo.log(str(response))
	return bson.json_util.dumps(response)

def advanceIter():
	global i
	i += 1
	return i
