# Ekatte

Database interaction is fully inside db.py.
## Inserting data into the database

Inserting all the data is done by running db.py from the cmd line.
You should create a virables.env file with all the credentials to the db.

```
db-username="your-db-username"
db-password="your-db-password!"
db-host="127.0.0.1"
db-port="xxxx"
db="your-db-name"
```
The required files can be downloaded from [here](http://www.nsi.bg/nrnm/)

Note: all the data files required should be inside the same folder as the script and have names as follows:
* Ek_obl.xlsx for areas
* Ek_obst.xlsx for municipalities
* Ek_atte.xlsx for settlements

## Front end

The front end uses ajax requests to get search data for the settlements and entries count.
To filter settlement data you can use the first form.

The second button is for stats about all the tables in the db (entries count).

## Libraries used

On the front end we use [DataTables](https://datatables.net) to visualize filter data.
The backend framework is flask. The db connector of choice is psycopg2 and we also use dotenv
for loading environment variables.
