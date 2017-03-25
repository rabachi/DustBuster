from matplotlib import pyplot as plt
import sys

file = open("targetnotinviewsemisuccess.txt",'r')
dt = []
center = []
controller_output = []
error = []
distance = []

words = []
count = []
iter_num = 0

for l in file:
	line = l.strip()
	words = line.split()
	count.append(iter_num)
	iter_num += 1
	dt.append(words[0])
	center.append(words[1])
	controller_output.append(words[2])
	error.append(words[3])
	distance.append(float(words[4]))

file.close()
#print count
print error

plt.figure(1)
plt.plot(count, dt)
plt.title("dt")
plt.grid(True)

plt.figure(2)
plt.plot(count, center,'ro')
plt.title("center")
plt.grid(True)

plt.figure(3)
plt.plot(count[10:], controller_output[10:], 'bo-')
plt.title("controller_output")
plt.xlabel("Time (s)")
plt.ylabel("Controller output as fraction of max speed (%)")
plt.grid(True)

plt.figure(4)
plt.plot(count[10:],error[10:], 'rs')
plt.title("error")
plt.xlabel("Time (s)")
plt.ylabel("Difference between center of image and target in image (pixels)")
plt.grid(True)

plt.figure(5)
plt.plot(count[10:],distance[10:],'gs-')
plt.title("distance")
plt.xlabel("Time (s)")
plt.ylabel("Distance to target (inches)")
plt.grid(True)


plt.show()