# YatraSetu — Real GPS Only Mode

This build intentionally has **NO simulated live vehicles**.

## Demo flow
1. Start backend: `cd backend` then `python main.py`
2. Start frontend: `cd frontend` then `npm install` and `npm run dev`
3. On the Driver phone, open the frontend and switch to Driver.
4. Enter a real registration number such as `UP78GC9845`, choose a route, and press **REGISTER**.
5. Press **START REAL GPS** and allow location permission.
6. On a passenger phone/browser, enter the same registration number and press **FIND**.
7. The passenger sees only coordinates, speed, ETA and timestamps sent by the driver's phone.

## Important
- `/buses` is empty until a vehicle has sent a real GPS update.
- `/vehicles/lookup` returns only vehicles with a real GPS update.
- WebSocket sends only real `VEHICLE_UPDATE` events.
- The old GPS simulator is not used.
- If the driver stops sending GPS, the passenger will eventually see the vehicle as offline/no longer live.

For two physical phones, the backend/frontend must be reachable over the same network (or deployed publicly). Browser GPS also normally requires HTTPS on real devices.
