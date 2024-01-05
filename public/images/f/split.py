import cv2
img = cv2.imread("rinnie.jpg")
size = 80
rows = 10
cols = 10
for i in range(0, cols):
    for j in range(rows):
        item = img[size*j:size*j+size,size*i:size*i+size,:]
        cv2.imwrite(str(i) + " " + str(j)+".png", item)
        
