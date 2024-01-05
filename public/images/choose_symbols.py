import random
import json
x = open("symbols.txt", "r").read().splitlines()
lst = []
for i in range(100):
    n = random.randint(0, len(x)-1)
    lst.append(x[n])
print(json.dumps(lst))
