import requests

url = "http://192.168.1.64:5000"
query = url + "/alumnos"
flag = url + "/update_flag"
month = url + "/update_month"

while True:
    matricula = int(input())
    alumno = {"matricula": matricula}
    consulta = requests.get(query, params=alumno)
    alumno["flag"] = 1
    update_flag = requests.post(flag, json=alumno)
    #alumno["dias_string"] = 
    #update_month = requests.post(month, json=alumno)

    for row in consulta.json():
        print(consulta.json()[row])
    #print(consulta.json())
    #print(update_data.json())
