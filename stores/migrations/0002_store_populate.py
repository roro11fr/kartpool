from django.utils import timezone
from django.db import IntegrityError, migrations
import json
from django.contrib.gis.geos import fromstr
from pathlib import Path
import logging

logger = logging.getLogger(__name__)
DATA_FILENAME = 'data/data.json'
CITY = 'Bucharest'


def load_data(apps, schema_editor):
    Store = apps.get_model('stores', 'Store')
    jsonfile = Path(__file__).parents[2] / DATA_FILENAME

    # Obține ultimul id existent din tabelă
    last_store = Store.objects.order_by('-id').first()  # Obține cel mai mare id
    last_id = last_store.id if last_store else 0  # Dacă nu există niciun id, începe de la 0

    with open(str(jsonfile), encoding='utf-8') as datafile:
        objects = json.load(datafile)
        stores_to_create = []
        for obj in objects['elements']:
            try:
                objType = obj['type']
                if objType == 'node':
                    tags = obj['tags']
                    name = tags.get('name', 'N/A')

                    longitude = obj.get('lon', 0)
                    latitude = obj.get('lat', 0)
                    if longitude == 0 or latitude == 0:  # Verifică dacă lat/lon sunt corecte
                        continue

                    location = fromstr(f'POINT({longitude} {latitude})', srid=4326)

                    housenumber = tags.get('addr:housenumber', 'N/A')
                    street = tags.get('addr:street', 'N/A')
                    postcode = tags.get('addr:postcode', 'N/A')
                    address = f'{housenumber}, {street}, {postcode}'

                    store_type = tags.get('shop', 'N/A')
                    phone = tags.get('phone', 'N/A')
                    
                    # Incrementează manual id-ul
                    last_id += 1
                    
                    # Adaugă obiectul cu id-ul unic
                    stores_to_create.append(Store(
                        id=last_id,  # Atribuie id-ul generat
                        name=name,
                        created_at=timezone.now(),
                        latitude=latitude,
                        longitude=longitude,
                        location=location,
                        store_type=store_type,
                        phone=phone[:100],
                        address=address[:100],
                        city=CITY,
                    ))

            except KeyError as e:
                logger.error(f'Missing key in store data: {e}')
            except IntegrityError as e:
                logger.error(f'Database error: {e}')
        
        if stores_to_create:  # Salvează toate instanțele la sfârșit
            Store.objects.bulk_create(stores_to_create)


class Migration(migrations.Migration):
    dependencies = [
        ('stores', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(load_data)
    ]

    class Meta:
        managed = False
