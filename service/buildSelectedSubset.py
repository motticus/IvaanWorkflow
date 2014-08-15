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

def run(fileList=None, keyword=None, value=None):
	response = {}
	item = json.loads(fileList);
	
	try:
		filelist = []
		saveGraph = []
		fulld = client["xmlVis"]
		response['keyword'] = keyword
		response['value'] = value
		for coll in item:
			fullcol = fulld[coll]
			check = fullcol.find_one({"_reference.collection":keyword, "_property.text":value})
			if check:
				response['check'] = "true"
				filelist.append(str(check["_reference"]["mainfile"]))
		fulldb = client["xmlVis"]
		fullcoll = fulldb["listfiles"]
		
		listOfRoot = fullcoll.find({"type":"tcga", 'file':{'$in':filelist}}).distinct("root");
		listOfRoot.sort()
		rootarr = []
		
		filesObj = DynamicObject()
		setattr(filesObj, "name", "root");
		setattr(filesObj, "type", "root");
		setattr(filesObj, "id", "-1");
		setattr(filesObj, "selected", "no");
		for listRoot in listOfRoot:
			subRoot = listRoot
			objRoot = DynamicObject()
			setattr(objRoot, "name", subRoot)
			setattr(objRoot, "type", "subRoot")
			setattr(objRoot, "id", advanceIter())
			setattr(objRoot, "selected", "no");
			listLocation = fullcoll.find({"type":"tcga", "root":subRoot, 'file':{'$in':filelist}}).distinct("location")
			locationarr = []
			listLocation.sort()
			for location in listLocation:
				locationObj = DynamicObject()
				setattr(locationObj, "name", location)
				setattr(locationObj, "type", "location")
				setattr(locationObj, "id", advanceIter());
				setattr(locationObj, "selected", "no");
				listType = fullcoll.find({"type":"tcga", "root":subRoot, "location":location, 'file':{'$in':filelist}}).distinct("roottype")
				listType.sort()
				typearr = []
				for typeVal in listType:
					typeObj = DynamicObject()
					setattr(typeObj, "name", typeVal)
					setattr(typeObj, "type", "type")
					setattr(typeObj, "id", advanceIter());
					setattr(typeObj, "selected", "no")
					listSub = fullcoll.find({"type":"tcga", "root":subRoot, "location":location, "roottype":typeVal, 'file':{'$in':filelist}}).distinct("subtype")
					listSub.sort()
					subArr = []
					for subType in listSub:
						subObj = DynamicObject()
						setattr(subObj, "name", subType)
						setattr(subObj, "type", "subtype")
						setattr(subObj, "id", advanceIter())
						setattr(subObj, "selected", "no");
						listForward = fullcoll.find({"type":"tcga", "root":subRoot, "location":location, "roottype":typeVal, "subtype":subType, 'file':{'$in':filelist}})
						forwardArr = []
						listForward.sort("forward")
						for forwardType in listForward:
							saveGraph.append(forwardType);
							forwardObj = DynamicObject()
							setattr(forwardObj, "name", forwardType["forward"])
							setattr(forwardObj, "type", "file")
							setattr(forwardObj, "file", forwardType["file"])
							setattr(forwardObj, "coll", forwardType["listedb"])
							setattr(forwardObj, "id", advanceIter())
							setattr(forwardObj, "selected", "no");
							forwardArr.append(forwardObj.__dict__)
						setattr(subObj, "children", forwardArr)
						subArr.append(subObj.__dict__)
					setattr(typeObj, "children", subArr)
					typearr.append(typeObj.__dict__)
				setattr(locationObj, "children", typearr)
				locationarr.append(locationObj.__dict__)
			setattr(objRoot, "children", locationarr)
			rootarr.append(objRoot.__dict__)
		setattr(filesObj, "children", rootarr)
		response['result'] = filesObj.__dict__
		response['saveState'] = saveGraph
		
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
