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


def run(fileList=None, keyword=None):
	response = {}
	item = json.loads(fileList);
	
	try:
		countarr = []
		fcountarr = []
		countObj = DynamicObject();
		countFiles = DynamicObject();
		fulldb = client["xmlVis"]
		filelist = []
		for coll in item:
			fullcoll = fulldb[coll]
			aggregate = fullcoll.aggregate([{"$match":{"_reference.collection":keyword}},{"$group":{"_id":"$_property.text", "number": {"$sum" : 1}}}])
			for agglist in aggregate["result"]:
				setattr(countObj, str(agglist["_id"]), agglist["number"] + getattr(countObj, str(agglist["_id"]), 0))
				setattr(countFiles, str(agglist["_id"]), getattr(countFiles, str(agglist["_id"]), 0) + 1)
				filelist.append({"coll":coll})
		newdict = countObj.__dict__
		filesdict = countFiles.__dict__
		for newitem in newdict:
			newObj = DynamicObject()
			setattr(newObj, "label", str(newitem))
			setattr(newObj, "value", newdict[newitem])
			countarr.append(newObj.__dict__);
		countarr = sorted(countarr, key=lambda k: k['value'], reverse=True) 
		sortcountarr = list(countarr)
		sortcountarr = sorted(sortcountarr, key=lambda k: k['label'], reverse=False) 
		response['minimum'] = countarr[-1]['value']
		response['maximum'] = countarr[0]['value']
		for filesitem in filesdict:
			newObj = DynamicObject()
			setattr(newObj, "label", str(filesitem))
			setattr(newObj, "value", filesdict[filesitem])
			fcountarr.append(newObj.__dict__);
		fcountarr = sorted(fcountarr, key=lambda k: k['value'], reverse=True) 
		fsortcountarr = list(fcountarr)
		fsortcountarr = sorted(fsortcountarr, key=lambda k: k['label'], reverse=False) 
		returnObj = DynamicObject()
		setattr(returnObj, "key", "number")
		setattr(returnObj, "color", "#4f99b4")
		setattr(returnObj, "values", countarr)
		
		sortreturnObj = DynamicObject()
		setattr(sortreturnObj, "key", "number")
		setattr(sortreturnObj, "color", "#C0C0C0")
		setattr(sortreturnObj, "values", sortcountarr)
		
		freturnObj = DynamicObject()
		setattr(freturnObj, "key", "file")
		setattr(freturnObj, "color", "#d67777")
		setattr(freturnObj, "values", fcountarr)

		fsortreturnObj = DynamicObject()
		setattr(fsortreturnObj, "key", "file")
		setattr(fsortreturnObj, "color", "#C0C0C0")
		setattr(fsortreturnObj, "values", fsortcountarr)
		
		response['length'] = len(countarr)
		returnarr = []
		returnarr.append(returnObj.__dict__)
		freturnarr = []
		freturnarr.append(freturnObj.__dict__)				
		sortreturnarr = []
		sortreturnarr.append(sortreturnObj.__dict__)
		fsortreturnarr = []
		fsortreturnarr.append(fsortreturnObj.__dict__)
		response['result'] = returnarr 
		response['sortresult'] = sortreturnarr;
		response['fileresult'] = freturnarr
		response['sortfileresult'] = fsortreturnarr
		response['coll'] = filelist
		
	except ValueError:
		response['error'] = "Could not convert to JSON"
		return bson.json_util.dumps(response)
	return bson.json_util.dumps(response)
