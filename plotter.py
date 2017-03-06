from matplotlib import pyplot as plt
import sys

file = open("log.txt",'r')
dt = []
center = []
controller_output = []
error = []

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

file.close()
print count

plt.figure(1)
plt.plot(count, dt)
plt.title("dt")

plt.figure(2)
plt.plot(count, center)
plt.title("center")

plt.figure(3)
plt.plot(count, controller_output)
plt.title("controller_output")

plt.figure(4)
plt.plot(count,error)
plt.title("error")

plt.grid(True)
plt.show()