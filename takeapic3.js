alternatively configure the app on the drone to save the images it take on the computer directly 
connect computer to bebop wifi 
follow this :  https://community.parrot.com/t5/Bebop-2-Knowledge-Base/How-to-copy-internal-pictures-of-the-Bebop2-using-Wi-Fi-and-a/ta-p/140580

• Default IP: 192.168.42.1
• Port: 21
• Path: internal_000/Bebop_Drone/media
• Username: anonymous
• Password: <no password>


we will just have drone.takePicture(); 
and then fs.open to get that file. 
