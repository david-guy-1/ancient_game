import cv2
img = cv2.imread("niichanka.png")
size = 80
rows = 10
cols = 10
for i in range(0, cols):
    for j in range(rows):
        item = img[size*j+600:size*j+size+600,size*i:size*i+size,:]
        cv2.imwrite(str(i) + " " + str(j)+"2.png", item)
        
