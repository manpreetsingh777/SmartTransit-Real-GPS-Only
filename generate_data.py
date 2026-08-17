import json
import random
from datetime import datetime, timedelta

# PSIT Location
PSIT_LAT = 26.4499
PSIT_LON = 80.1927

# Load stops
with open(r'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\data\stops.json', 'r', encoding='utf-8') as f:
    stops_list = json.load(f)
stops_map = {s['id']: s for s in stops_list}

# Define 37 PSIT Routes based on official document
raw_routes_data = [
    {
        "routeNumber": "1",
        "busNumber": "5081",
        "regNumber": "UP 78 BT 5081",
        "conductor": "Shivam",
        "phone": "+91 84234 21914",
        "originName": "Jajmau / KDA Chauraha",
        "startTime": "07:45 AM",
        "stops": ["STP-JAJMAU", "STP-KDA-CHAU", "STP-PSIT"]
    },
    {
        "routeNumber": "2",
        "busNumber": "4218",
        "regNumber": "UP 78 BT 4218",
        "conductor": "Arun",
        "phone": "+91 75187 83536",
        "originName": "JK I & II (Kamla Nagar)",
        "startTime": "07:45 AM",
        "stops": ["STP-JK-1-2", "STP-PSIT"]
    },
    {
        "routeNumber": "3",
        "busNumber": "6077",
        "regNumber": "UP 78 BT 6077",
        "conductor": "Devendra Kushvaha",
        "phone": "+91 88582 45844",
        "originName": "Harjendra Nagar / Rama Devi",
        "startTime": "07:45 AM",
        "stops": ["STP-HARJENDRA", "STP-RAMA-DEVI", "STP-PSIT"]
    },
    {
        "routeNumber": "4",
        "busNumber": "8082",
        "regNumber": "UP 78 BT 8082",
        "conductor": "Sonu",
        "phone": "+91 73399 88565",
        "originName": "Ahirwa Police Chowki",
        "startTime": "07:45 AM",
        "stops": ["STP-AHIRWA", "STP-PSIT"]
    },
    {
        "routeNumber": "5",
        "busNumber": "9845",
        "regNumber": "UP 78 BT 9845",
        "conductor": "Arun",
        "phone": "+91 82993 98670",
        "originName": "Patel Nagar / HAL Township",
        "startTime": "07:50 AM",
        "stops": ["STP-PATEL-NAGAR", "STP-HAL", "STP-PSIT"]
    },
    {
        "routeNumber": "6",
        "busNumber": "8076",
        "regNumber": "UP 78 BT 8076",
        "conductor": "Amit",
        "phone": "+91 95659 92083",
        "originName": "Kashi Ram Hospital / Krishna Nagar",
        "startTime": "07:45 AM",
        "stops": ["STP-KASHI-RAM", "STP-GANDHI-GRAM", "STP-KRISHNA-NAGAR", "STP-PSIT"]
    },
    {
        "routeNumber": "7",
        "busNumber": "9844",
        "regNumber": "UP 78 BT 9844",
        "conductor": "Vimal Pal",
        "phone": "+91 73986 31463",
        "originName": "Shyam Nagar (Virendra Swaroop)",
        "startTime": "07:50 AM",
        "stops": ["STP-SHYAM-SCH", "STP-PSIT"]
    },
    {
        "routeNumber": "8",
        "busNumber": "8077",
        "regNumber": "UP 78 BT 8077",
        "conductor": "Sumit Kumar",
        "phone": "+91 70688 44726",
        "originName": "Harihar Dham / PAC Vahini",
        "startTime": "07:55 AM",
        "stops": ["STP-HARIHAR", "STP-PAC-VAHINI", "STP-PSIT"]
    },
    {
        "routeNumber": "9",
        "busNumber": "5582",
        "regNumber": "UP 78 BT 5582",
        "conductor": "Rambeer",
        "phone": "+91 85659 48141",
        "originName": "Gurahar Rai / Mangala Vihar / Koyla Nagar",
        "startTime": "07:50 AM",
        "stops": ["STP-GURAHAR", "STP-MANGALA", "STP-KOYLA-NAGAR", "STP-PSIT"]
    },
    {
        "routeNumber": "10",
        "busNumber": "5083",
        "regNumber": "UP 78 BT 5083",
        "conductor": "Nitin",
        "phone": "+91 63935 95882",
        "originName": "Shyam Nagar Bypass / Gopal Nagar",
        "startTime": "07:50 AM",
        "stops": ["STP-SHYAM-BYPASS", "STP-GOPAL-NAGAR", "STP-PRATAP-HOTEL", "STP-PSIT"]
    },
    {
        "routeNumber": "11",
        "busNumber": "5082",
        "regNumber": "UP 78 BT 5082",
        "conductor": "Kuldeep",
        "phone": "+91 78971 03573",
        "originName": "Yashoda Nagar Bypass",
        "startTime": "07:55 AM",
        "stops": ["STP-YASHODA-BYPASS", "STP-PSIT"]
    },
    {
        "routeNumber": "12",
        "busNumber": "6983",
        "regNumber": "UP 78 BT 6983",
        "conductor": "Shyam Saran",
        "phone": "+91 63069 91228",
        "originName": "LIC Building (Mall Road)",
        "startTime": "07:40 AM",
        "stops": ["STP-LIC-BLDG", "STP-PSIT"]
    },
    {
        "routeNumber": "13",
        "busNumber": "6076",
        "regNumber": "UP 78 BT 6076",
        "conductor": "Harsit",
        "phone": "+91 90055 94806",
        "originName": "Narauna Chauraha / Rail Bazar",
        "startTime": "07:40 AM",
        "stops": ["STP-NARAUNA", "STP-PANDIT-HOTEL", "STP-MEER-PUR", "STP-RAIL-BAZAR", "STP-PSIT"]
    },
    {
        "routeNumber": "14",
        "busNumber": "1019",
        "regNumber": "UP 78 BT 1019",
        "conductor": "Amit",
        "phone": "+91 73988 89258",
        "originName": "Ghanta Ghar / Tat Mill",
        "startTime": "07:45 AM",
        "stops": ["STP-GHANTA-GHAR", "STP-TAT-MILL", "STP-PSIT"]
    },
    {
        "routeNumber": "15",
        "busNumber": "0225",
        "regNumber": "UP 78 BT 0225",
        "conductor": "Rajababu",
        "phone": "+91 88969 09476",
        "originName": "Anand Puri / Kidwai Nagar / RBI Colony",
        "startTime": "07:50 AM",
        "stops": ["STP-ANAND-PURI", "STP-KIDWAI-CHAU", "STP-SANI-MANDIR", "STP-ALANKAR", "STP-PSIT"]
    },
    {
        "routeNumber": "16",
        "busNumber": "5594",
        "regNumber": "UP 78 BT 5594",
        "conductor": "Dinesh",
        "phone": "+91 96167 73085",
        "originName": "Site No. 1 / UP Kirana / Durga Mandir",
        "startTime": "07:50 AM",
        "stops": ["STP-SITE-1", "STP-UP-KIRANA", "STP-DURGA-MANDIR", "STP-PSIT"]
    },
    {
        "routeNumber": "17",
        "busNumber": "5065",
        "regNumber": "UP 78 BT 5065",
        "conductor": "Jagat Narayan",
        "phone": "+91 81274 65560",
        "originName": "Baradevi / Juhi Depot / Sai Mandir / Gaushala",
        "startTime": "07:50 AM",
        "stops": ["STP-BARADEVI", "STP-JUHI-DEPOT", "STP-KIDWAI-THANA", "STP-SAI-MANDIR-CHAU", "STP-GAUSHALA", "STP-PSIT"]
    },
    {
        "routeNumber": "18",
        "busNumber": "4215",
        "regNumber": "UP 78 BT 4215",
        "conductor": "Sani",
        "phone": "+91 80815 93530",
        "originName": "Phoolbagh / Bada Chauraha / Chunni Ganj",
        "startTime": "07:40 AM",
        "stops": ["STP-PHOOLBAGH", "STP-MEGHDOOT", "STP-BARA-CHAU", "STP-PARADE", "STP-LAL-IMLI", "STP-CHUNNI-GANJ", "STP-PSIT"]
    },
    {
        "routeNumber": "19",
        "busNumber": "8078",
        "regNumber": "UP 78 BT 8078",
        "conductor": "Sachin",
        "phone": "+91 96858 52580",
        "originName": "Bazaria / Motijheel / Hallet / JK Mandir",
        "startTime": "07:50 AM",
        "stops": ["STP-BAZARIA", "STP-HARSH-NAGAR", "STP-BENA-JHAVAR", "STP-MOTIJHEEL", "STP-HAILET-HOSP", "STP-JK-MANDIR", "STP-RANGOLI", "STP-MARIAMPUR", "STP-PSIT"]
    },
    {
        "routeNumber": "20",
        "busNumber": "4216",
        "regNumber": "UP 78 BT 4216",
        "conductor": "Rahul",
        "phone": "+91 79854 66366",
        "originName": "Green Park / Rave 3 / Arya Nagar",
        "startTime": "07:40 AM",
        "stops": ["STP-PADAM-APPT", "STP-GREEN-PARK", "STP-MERCHANT-CHAMBER", "STP-ELGIN-MILL", "STP-GWALTOLI", "STP-RAVE-3", "STP-RAJEEV-PUMP", "STP-ARYA-NAGAR", "STP-PSIT"]
    },
    {
        "routeNumber": "21",
        "busNumber": "9682",
        "regNumber": "UP 78 BT 9682",
        "conductor": "Satyam Kamal",
        "phone": "+91 79919 84852",
        "originName": "P. Road / Jarib Chauki",
        "startTime": "07:50 AM",
        "stops": ["STP-P-ROAD", "STP-JARIB-CHAUKI", "STP-PSIT"]
    },
    {
        "routeNumber": "22",
        "busNumber": "1018",
        "regNumber": "UP 78 BT 1018",
        "conductor": "Rajeshwar",
        "phone": "+91 96512 93631",
        "originName": "Afim Kothi / Fazalganj / Armapur / Panki MIG",
        "startTime": "07:50 AM",
        "stops": ["STP-AFIM-KOTHI", "STP-CITY-CLUB", "STP-JARIB-CHAUKI", "STP-JK-JUTE", "STP-FAZALGANJ", "STP-ARMAPUR-ESTATE", "STP-PANKI-MIG", "STP-PSIT"]
    },
    {
        "routeNumber": "23",
        "busNumber": "3258",
        "regNumber": "UP 78 BT 3258",
        "conductor": "Ashok Pal",
        "phone": "+91 88536 28134",
        "originName": "Bharam Nagar / 80 Ft. Road / Gumti",
        "startTime": "07:45 AM",
        "stops": ["STP-BHARAM-NAGAR", "STP-80FT-PUMPS", "STP-80FT-BHASIN", "STP-GUMTI-GURDWARA", "STP-PSIT"]
    },
    {
        "routeNumber": "24",
        "busNumber": "6981",
        "regNumber": "UP 78 BT 6981",
        "conductor": "Satish",
        "phone": "+91 93245 95868",
        "originName": "Coca Cola / Kaushalpuri / Shastri Nagar / Vijay Nagar",
        "startTime": "07:50 AM",
        "stops": ["STP-COCA-COLA", "STP-NAZIRABAD", "STP-KAUSHALPURI", "STP-CHAIN-FACTORY", "STP-BOB-SHASTRI", "STP-CL-HOSP", "STP-PSIT"]
    },
    {
        "routeNumber": "25",
        "busNumber": "1020",
        "regNumber": "UP 78 BT 1020",
        "conductor": "Vijay Pal",
        "phone": "+91 93274 51756",
        "originName": "Company Bagh / Nawabganj / Signature Green",
        "startTime": "07:45 AM",
        "stops": ["STP-COMPANY-BAGH", "STP-NAWABGANJ-THANA", "STP-AZAD-NAGAR", "STP-SIGNATURE-GREEN", "STP-JUGAL-DEVI", "STP-KESA-COLONY", "STP-PSIT"]
    },
    {
        "routeNumber": "26",
        "busNumber": "5171",
        "regNumber": "UP 78 BT 5171",
        "conductor": "Pawan",
        "phone": "+91 96514 38458",
        "originName": "Signature Green / 9 No. Crossing / Chapeda Pulia",
        "startTime": "07:50 AM",
        "stops": ["STP-SIGNATURE-GREEN", "STP-JUGAL-DEVI", "STP-KESA-COLONY", "STP-9NO-CROSSING", "STP-ANURAG-HOSP", "STP-CHAPEDA-PULIA", "STP-PSIT"]
    },
    {
        "routeNumber": "27",
        "busNumber": "6982",
        "regNumber": "UP 78 BT 6982",
        "conductor": "Dheeraj Singh",
        "phone": "+91 63920 93755",
        "originName": "Makadikhera CNG / Gurdev Chauraha",
        "startTime": "07:45 AM",
        "stops": ["STP-MAKADIKHERA", "STP-SALES-TAX", "STP-GURDEV-CHAU", "STP-PSIT"]
    },
    {
        "routeNumber": "28",
        "busNumber": "0224",
        "regNumber": "UP 78 BT 0224",
        "conductor": "Brijesh Pal",
        "phone": "+91 75239 00668",
        "originName": "Saneshwar Mandir / Double Pulia / Vijay Nagar",
        "startTime": "07:55 AM",
        "stops": ["STP-SANESHWAR", "STP-NAMAK-FACTORY", "STP-GOPALA-TOWER", "STP-DOUBLE-PULIA", "STP-VIJAY-MANDI", "STP-VIJAY-NAGAR", "STP-PSIT"]
    },
    {
        "routeNumber": "29",
        "busNumber": "3259",
        "regNumber": "UP 78 BT 3259",
        "conductor": "Abhishek Pandey",
        "phone": "+91 73883 01801",
        "originName": "Navsheel Dham / Ratan Orbit / CSJM University",
        "startTime": "07:40 AM",
        "stops": ["STP-NAVSHEEL-DHAM", "STP-INDRA-NAGAR", "STP-RATAN-ORBIT", "STP-CSJM-UNIV", "STP-PSIT"]
    },
    {
        "routeNumber": "30",
        "busNumber": "6481",
        "regNumber": "UP 78 BT 6481",
        "conductor": "Pawan",
        "phone": "+91 96514 38458",
        "originName": "Saneshwar Mandir / KDMA World / Brahm Dev",
        "startTime": "07:50 AM",
        "stops": ["STP-SANESHWAR", "STP-KDMA-WORLD", "STP-BRAHM-DEV", "STP-PSIT"]
    },
    {
        "routeNumber": "31",
        "busNumber": "4217",
        "regNumber": "UP 78 BT 4217",
        "conductor": "Yogendra",
        "phone": "+91 99566 60619",
        "originName": "Escorts World School / Awas Vikas I & III",
        "startTime": "07:50 AM",
        "stops": ["STP-ESCORTS-SCHOOL", "STP-AWAS-VIKAS", "STP-PSIT"]
    },
    {
        "routeNumber": "32",
        "busNumber": "0223",
        "regNumber": "UP 78 BT 0223",
        "conductor": "Neeraj Pal",
        "phone": "+91 99354 13954",
        "originName": "Mandhana / Ratan Orbit / IIT Gate / Kalyanpur",
        "startTime": "07:40 AM",
        "stops": ["STP-MANDHANA-CHOWKI", "STP-RATAN-ORBIT", "STP-IIT-GATE", "STP-KALYANPUR-CROSSING", "STP-PSIT"]
    },
    {
        "routeNumber": "33",
        "busNumber": "4216-B",
        "regNumber": "UP 78 BT 4217",
        "conductor": "Babban",
        "phone": "+91 73881 45047",
        "originName": "MPGI / Kalyanpur / Lodheshwar / Panki / BMC",
        "startTime": "07:50 AM",
        "stops": ["STP-BAGIA-CROSSING", "STP-MP-COLLEGE", "STP-KALYANPUR-CHOWKI", "STP-LODHESHWAR", "STP-GAYATRI-PALACE", "STP-AMARAPUR-GATE", "STP-PANKI-CHOWKI", "STP-BMC-HOSP", "STP-PSIT"]
    },
    {
        "routeNumber": "34",
        "busNumber": "3256",
        "regNumber": "UP 78 BT 3256",
        "conductor": "Abhishek Singh",
        "phone": "+91 95697 03012",
        "originName": "Hanspuram / Machharia / Naubasta",
        "startTime": "07:45 AM",
        "stops": ["STP-HANSPURAM", "STP-NAUBASTA-BAMBA", "STP-MACHHARIA", "STP-DASU-KUAN", "STP-NAUBASTA-CHAU", "STP-PSIT"]
    },
    {
        "routeNumber": "35",
        "busNumber": "5581",
        "regNumber": "UP 78 BT 5581",
        "conductor": "Sandeep Singh",
        "phone": "+91 90261 47284",
        "originName": "Naubasta / Damodar Nagar / Barra / Gujaini Bypass",
        "startTime": "07:55 AM",
        "stops": ["STP-NAUBASTA-CHAU", "STP-DAMODAR-NAGAR", "STP-BARRA-BYPASS", "STP-PRIYA-HOSP", "STP-BASHANT-PUMP", "STP-KARGIL-PUMP", "STP-GUJAINI-BYPASS", "STP-PSIT"]
    },
    {
        "routeNumber": "36",
        "busNumber": "5391",
        "regNumber": "UP 78 BT 5391",
        "conductor": "Sntosh Kumar",
        "phone": "+91 74580 47192",
        "originName": "CTI / Nandlal / Deep Cinema / Saket Nagar",
        "startTime": "07:45 AM",
        "stops": ["STP-CTI-CHAU", "STP-DAWAT-REST", "STP-BHOLA-DAIRY", "STP-NANDLAL-CHAU", "STP-DEEP-CINEMA", "STP-HONDA-SAKET", "STP-SOCIETY-MOTOR", "STP-PSIT"]
    },
    {
        "routeNumber": "37",
        "busNumber": "3257",
        "regNumber": "UP 78 BT 3257",
        "conductor": "Vipin Singh",
        "phone": "+91 96955 09954",
        "originName": "Dabouli / Shastri Chowk / Barra-2 / Sachan",
        "startTime": "07:45 AM",
        "stops": ["STP-DABOULI-STAND", "STP-RATANLAL-PUMP", "STP-SAURABH-GUEST", "STP-SHASTRI-CHOWK", "STP-BARRA-TANKI", "STP-HANUMAN-BARRA2", "STP-SACHAN-GUEST", "STP-PSIT"]
    }
]

colors = [
    "#00f2fe", "#10b981", "#a855f7", "#f59e0b", "#3b82f6", "#ec4899", "#14b8a6", "#8b5cf6",
    "#06b6d4", "#84cc16", "#f97316", "#6366f1", "#eab308", "#22c55e", "#0ea5e9", "#d946ef"
]

routes = []
buses = []
timetables = []
history_records = []

now_iso = datetime.utcnow().isoformat() + "Z"

for idx, r in enumerate(raw_routes_data):
    route_id = f"RT-{r['routeNumber']}"
    bus_id = f"BUS-{r['busNumber']}"
    color = colors[idx % len(colors)]
    
    # Generate waypoints connecting the sequence of stops to PSIT
    wp_list = []
    for sid in r['stops']:
        st = stops_map.get(sid)
        if st:
            wp_list.append([round(st['latitude'], 6), round(st['longitude'], 6)])
    
    # Add intermediate interpolation points for smoother map movement if needed
    full_waypoints = []
    for i in range(len(wp_list) - 1):
        p1 = wp_list[i]
        p2 = wp_list[i + 1]
        full_waypoints.append(p1)
        # 1 midpoint
        full_waypoints.append([round((p1[0] + p2[0]) / 2, 6), round((p1[1] + p2[1]) / 2, 6)])
    full_waypoints.append(wp_list[-1])
    
    # Estimate distance (km)
    dist_km = round(12.0 + (len(r['stops']) * 2.8) + (idx * 0.35), 1)
    duration_mins = 45 if dist_km > 18 else 35
    
    route_obj = {
        "id": route_id,
        "routeNumber": r['routeNumber'],
        "name": f"Route {r['routeNumber']}: {r['originName']} ⇄ PSIT Bhauti",
        "shortName": f"R-{r['routeNumber']} ({r['originName'][:22]})",
        "color": color,
        "origin": r['originName'],
        "destination": "PSIT Campus (Bhauti)",
        "totalDistanceKm": dist_km,
        "avgDurationMinutes": duration_mins,
        "corridorRadiusMeters": 180,
        "stops": r['stops'],
        "waypoints": full_waypoints
    }
    routes.append(route_obj)
    
    # Bus object with passenger carried (30 to 44)
    capacity = 44
    passengers_carried = random.randint(30, 44)
    occupancy_ratio = passengers_carried / capacity
    occupancy_level = "HIGH" if occupancy_ratio >= 0.85 else "MEDIUM" if occupancy_ratio >= 0.70 else "LOW"
    
    # Generate realistic status distribution (mostly LIVE, a few DELAYED)
    status = "DELAYED" if idx in [3, 14, 27] else "LIVE"
    gps_health = "WEAK" if idx == 11 else "HEALTHY"
    
    # Initial location along route
    curr_stop_idx = min(1, len(r['stops']) - 1)
    init_lat = full_waypoints[min(1, len(full_waypoints) - 1)][0]
    init_lon = full_waypoints[min(1, len(full_waypoints) - 1)][1]
    
    bus_obj = {
        "id": bus_id,
        "busNumber": r['busNumber'],
        "regNumber": r['regNumber'],
        "model": "Tata Starbus Ultra AC / PSIT Fleet",
        "capacity": capacity,
        "passengersCarried": passengers_carried,
        "occupancy": occupancy_level,
        "routeId": route_id,
        "routeName": route_obj['name'],
        "driverId": f"CND-{r['busNumber']}",
        "driverName": f"Conductor {r['conductor']}",
        "driverPhone": r['phone'],
        "status": status,
        "gpsHealth": gps_health,
        "gpsSource": "SMARTPHONE_APP" if idx % 2 == 0 else "IOT_DEVICE",
        "batteryLevel": random.randint(75, 98),
        "currentSpeed": round(random.uniform(26.0, 38.0), 1),
        "latitude": init_lat,
        "longitude": init_lon,
        "heading": round(random.uniform(45.0, 120.0), 1),
        "lastUpdate": now_iso,
        "currentStopIndex": curr_stop_idx,
        "nextStopId": r['stops'][min(curr_stop_idx, len(r['stops']) - 1)],
        "etaMinutes": max(4, round(random.uniform(6, 18))),
        "etaConfidence": "HIGH",
        "isDeviated": False,
        "anomalyScore": random.randint(0, 8),
        "delayMinutes": 12 if status == "DELAYED" else 0,
        "lastValidLocation": {
            "latitude": init_lat,
            "longitude": init_lon,
            "timestamp": now_iso
        }
    }
    buses.append(bus_obj)
    
    # Timetable object
    timetable_obj = {
        "routeId": route_id,
        "serviceName": f"PSIT Route {r['routeNumber']} Official Service",
        "operatingHours": f"{r['startTime']} - 05:45 PM",
        "morningPickup": r['startTime'],
        "collegeArrival": "08:45 AM",
        "eveningDeparture": "05:15 PM",
        "peakHeadwayMins": 15,
        "offPeakHeadwayMins": 30,
        "fare": { "minFare": 0, "maxFare": 0, "currency": "INR (Institutional Pass)" },
        "schedule": [
            { "tripId": f"TRP-{r['busNumber']}-M", "departureTime": r['startTime'], "busId": bus_id, "type": "Morning Inward" },
            { "tripId": f"TRP-{r['busNumber']}-E", "departureTime": "05:15 PM", "busId": bus_id, "type": "Evening Outward" }
        ]
    }
    timetables.append(timetable_obj)
    
    # Generate 7 realistic previous historical trips for every bus
    for day_offset in range(1, 8):
        trip_date = (datetime.utcnow() - timedelta(days=day_offset)).strftime("%b %d, %Y")
        passengers = random.randint(30, 44)
        is_delayed = random.random() < 0.18
        delay_min = random.randint(5, 14) if is_delayed else 0
        speed_avg = round(random.uniform(28.0, 36.5), 1)
        trip_status = "Delayed" if is_delayed else "Completed"
        
        hist_entry = {
            "tripId": f"HIST-{r['busNumber']}-{day_offset}",
            "busId": bus_id,
            "busNumber": r['busNumber'],
            "routeId": route_id,
            "routeName": route_obj['name'],
            "date": trip_date,
            "timeSlot": "07:45 AM - 08:45 AM",
            "origin": r['originName'],
            "destination": "PSIT Bhauti",
            "distanceKm": dist_km,
            "avgSpeedKmH": speed_avg,
            "passengersCarried": passengers,
            "delayMinutes": delay_min,
            "status": trip_status,
            "routeCompliance": "100%" if not is_delayed else "97.5%",
            "fuelEfficiency": f"{round(random.uniform(3.8, 4.6), 1)} km/L",
            "conductor": r['conductor']
        }
        history_records.append(hist_entry)

# Write to data directory
with open(r'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\data\routes.json', 'w', encoding='utf-8') as f:
    json.dump(routes, f, indent=2)

with open(r'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\data\buses.json', 'w', encoding='utf-8') as f:
    json.dump(buses, f, indent=2)

with open(r'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\data\timetables.json', 'w', encoding='utf-8') as f:
    json.dump(timetables, f, indent=2)

with open(r'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\data\history.json', 'w', encoding='utf-8') as f:
    json.dump(history_records, f, indent=2)

# Also copy to frontend/src/data/
for fname in ['routes.json', 'buses.json', 'timetables.json', 'history.json', 'stops.json']:
    src = rf'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\data\{fname}'
    dst = rf'C:\Users\Manpreet Singh\.gemini\antigravity\scratch\smarttransit\frontend\src\data\{fname}'
    with open(src, 'r', encoding='utf-8') as f1, open(dst, 'w', encoding='utf-8') as f2:
        f2.write(f1.read())

print(f"Successfully generated: {len(routes)} routes, {len(buses)} buses, {len(timetables)} timetables, {len(history_records)} historical trips!")
