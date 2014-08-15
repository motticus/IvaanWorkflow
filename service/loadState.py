#!/usr/bin/python -tt
import sys, pymongo, os, glob, re, bson.json_util, json

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

def run():
	response = {}
	try:
		fulldb = client["saveState"]
		fullcoll = fulldb["files"]
		listOfRoot = fullcoll.find({})
		loadList = []
		for listRoot in listOfRoot:
			main = DynamicObject()
			setattr(main, "collection", listRoot["collection"])
			setattr(main, "name", listRoot["name"])
			setattr(main, "keyword", listRoot["keyword"])
			setattr(main, "value", listRoot["value"])			
			loadList.append(main.__dict__)
		response['result'] = loadList
		
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
