#include<iostream>
#include<algorithm>
#include<vector>

int main(){
  int n, k;
  std::vector<int> goats;
  std::cin>>n>>k;
  int w = 0;
  for(int i = 0; i < n; i++){
    std::cin>>w;
    goats.push_back(w);
  }
  std::sort(goats.rbegin(), goats.rend());
  std::vector<bool>used(n, false);
  int curr_k, curr_w = 0, max_w = goats[0] - 1, saved_goats = 0;
  do
  {
    curr_k = 0;
    saved_goats = 0;
    max_w++;
    while(saved_goats < n){
      curr_w = 0;
      for(int i = 0; i < n; i++){
        //std::cout<<used[i]<< " " << goats[i] << std::endl;
        //std::cin>>w;
        if(!used[i] && curr_w + goats[i] <= max_w){
          curr_w += goats[i];
          used[i] = true;
          saved_goats++;
        }
        if(curr_w == max_w){
          break;
        }
      }
      curr_k++;
    }
    std::fill(used.begin(), used.end(), false);
  }while (curr_k > k);
  std::cout<<max_w;
  return 0;
}