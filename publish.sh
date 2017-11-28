if [ $# -eq 0 ]
  then
    git checkout -b dist
    git rebase master
    git push origin dist
    git checkout master
else
  git checkout -b dist
  git rebase ${1}
  git push origin dist
  git checkout ${1}
fi