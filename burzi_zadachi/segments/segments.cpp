#include<iostream>
#include<algorithm>
#include<vector>

int main(){
    int n, a, b, c;
    std::cin>>n>>a>>b>>c;
    std::vector<int> segments;
    for(int i = 0; i <= n/a; i++)
    {
        segments.push_back(i * a);
    }
    for (int i = 0; i <= n/b; i++)
    {
        segments.push_back(n - i * b);
    }
    std::sort(segments.begin(), segments.end());
    segments.erase(unique(segments.begin(), segments.end()), segments.end());
    int prevSegEndIdx = 0;
    int painted_l = 0;
    for(uint i = 0; i < segments.size() - 1; i++){
        for(uint j = i + 1; j < segments.size(); j++){
            if(segments[j] - segments[i] == c){
                painted_l += c;
                if(prevSegEndIdx < j && prevSegEndIdx > i){
                    painted_l -= (segments[prevSegEndIdx] - segments[i]);
                }
                prevSegEndIdx = j;
                break;
            }
        }
    }
    std::cout<<n - painted_l;
}