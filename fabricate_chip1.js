for feature f in F do
if f.DFMClass = ”XY” then
featureList;
depth ← f.depth;
if depthMap.keyexists(depth) then
featureList ← depthMap.value(depth);
end
else
initialize featureList;
depthM ap[depth] ← featureList;
end
featureList.append(f);
end
else if f.DFMClass = ”XYZ” then
solidObjectList.append(f);
end
else if f.DFMClass = ”Z” then
drillList.append(f);
end
else if f.DFMClass = ”EDGE” then
bordersList.append(f);
end
M.layers ← depthMap.values;
M.borders ← bordersList;
M.3Dobjects ← solidObjectList;
M.drills ← drillList;
end
