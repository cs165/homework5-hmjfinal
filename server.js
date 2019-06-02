const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1SMWDGBhKH9_Glmr5sKtwmVXGCtWeuUY5UQcnGIqcRKA';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

function format(rows)
{
 if(!(rows instanceof Array))
{
	console.log('not array,please check back data!')
	 process.exit()  
}
  var tr=rows.shift(rows);
  var ret= new Array();
 for  (var index in rows)
	{
		chidren= new Object()
		for (var index_d in tr)
		{
			chidren[tr[index_d]]=rows[index][index_d]
		}
		ret.push(chidren)
}
return ret
}

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  //console.log(ret)
  // TODO(you): Finish onGet.

  res.json( format(rows));
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
 const result = await sheet.getRows();
	const rows = result.rows;
	const data=new Array();
var  tr=rows.shift(rows);
var ret ={"response": "false"}
for (var index in tr)
{
	console.log(messageBody[tr[index]],tr[index])
	if(messageBody[tr[index]]!=undefined){
	data.push(messageBody[tr[index]])}
}
if(data.length!=tr.length)
{
 ret ={"response": "key error"}
}
else
{
ret=await sheet.appendRow(data);
  // TODO(you): Implement onPost.
}
  res.json(ret);
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column.toLowerCase();
  const value  = req.params.value;
  const messageBody = req.body;

  // TODO(you): Implement onPatch.
const back=await sheet.getRows();
const result = format(back.rows);
const data=new Array()
var ret={  "response": "false"}
var count=0
for (var index in result)
{
	if(result[index][column]==value)
	{
		for (var data_c in  result[index])
		{
			if(messageBody[data_c]!=undefined)
			{
				count+=1
				data.push(messageBody[data_c])
			}
			else
			{
				data.push(result[index][data_c])
			}

		}
		c_index=parseInt(index)+1
		console.log(data)
		if(count!=0)
		{
		ret=await  sheet.setRow(c_index,data)
		}
		else
		{
			ret={  "response": "change data key erro"}

		}
		break;
	}
}
  res.json(ret);
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column.toLowerCase();
  const value  = req.params.value;
const back=await sheet.getRows()
const result = format(back.rows);
var ret={  "response": "false"}
for (var index in result)
{
	if(result[index][column]==value)
	{
		delete_index=parseInt(index)+1
		ret=await  sheet.deleteRow(delete_index)
		break;
	}
	
}

  // TODO(you): Implement onDelete.

  res.json( ret );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server listening on port ${port}!`);
});
