#include<iostream>
#include<vector>

void makeBad(std::vector<int>&grid,
    bool predicate, int newPos, int newValue, int& bad_ammount, int& startIdx){
    if(predicate && grid[newPos] == 0){
        grid[newPos] = newValue;
        bad_ammount++;
        if(newPos < startIdx){
            startIdx = newPos;
        }
    }
}

int main(){
    int height, width, days;
    int bad_ammount;
    std::cin >> height >> width >> days;
    std::vector<int> grid(height * width, 0);
    int startX = 0, startY = 0;
    std::cin >> bad_ammount;
    for(int i = 0; i < bad_ammount; i++){
        int y, x;
        std::cin>>y>>x;
        y--;
        x--;
        if(startY > y){
            startY = y;
            startX = x;
        }else if(startY == y){
            if(startX > x){
                startX = x;
            }
        }
        grid[width * y + x] = 1;
    }
    int startIdx = startY * width + startX;
    for(int j = 0; j < days; j++){
        for(int i = startIdx; i < grid.size(); i++){
            if(grid[i] == 1) {
                makeBad(grid, i/width != 0, i - width, 1, bad_ammount, startIdx);
                makeBad(grid, i/width + 1 != height, i + width, 2, bad_ammount, startIdx);
                makeBad(grid, i%width != 0, i - 1, 1, bad_ammount, startIdx);
                makeBad(grid, i%width + 1 != width, i + 1, 2, bad_ammount, startIdx);
            }else if(grid[i] == 2){
                grid[i] = 1;
            }
        }
    }
    std::cout<<grid.size() - bad_ammount;
}