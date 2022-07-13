# Git Clone
```
git clone \
  --depth 1  \
  --filter=blob:none  \
  --sparse \
  https://github.com/cidarlab/3duf \
  library
;
cd library
git sparse-checkout set src/app/library
```
