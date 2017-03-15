from matplotlib import pyplot as plt
import sys

file = open("log.txt",'r')
dt = []
center = []
controller_output = []
error = []
area_ratio = []
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
	area_ratio.append(float(words[4]))
	distance.append(float(words[5]))

file.close()
#print count
print error

plt.figure(1)
plt.plot(count, dt)
plt.title("dt")
plt.grid(True)

plt.figure(2)
plt.plot(count, center)
plt.title("center")
plt.grid(True)

plt.figure(3)
plt.plot(count, controller_output)
plt.title("controller_output")
plt.grid(True)

plt.figure(4)
plt.plot(count,error)
plt.title("error")
plt.grid(True)

plt.figure(5)
plt.plot(count,area_ratio)
plt.title("area_ratio")
plt.grid(True)

plt.figure(6)
plt.plot(count,distance)
plt.title("distance")
plt.grid(True)


plt.show()