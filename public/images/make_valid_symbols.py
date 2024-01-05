
for a in "dt,ut,r,".split(","):
    for b in "dt,ut,r,".split(","):
        for c in "dt,ut,r,".split(","):
            for d in "dt,ut,r,".split(","):
                for e in "dt,ut,r,".split(","):
                    for f in "dt,ut,r,".split(","):
                        for g in "t,r,".split(","):
                            for h in "t,r,".split(","):
                                count = 8 - [a,b,c,d,e,f,g,h].count("")
                                
                                if(count < 3 or count > 4):
                                    continue

                                print("\"" + ",".join([a,b,c,d,e,f,g,h]) + "\",")
