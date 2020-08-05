xquery version "1.0-ml";
module namespace resource = "http://marklogic.com/rest-api/resource/jobManagement";
declare function getNext($current,$count,$diff,$result, $perimeter){
  let $newResult := if ($current eq 0)
                    then cts:uris((),(), $perimeter)[1]
                    else cts:uris($result,(),$perimeter)[$diff+1]
  return if($current lt $count)
         then ($newResult,getNext($current + 1,$count,$diff,$newResult, $perimeter))
         else $newResult
};
declare function post(
        $context as map:map,
        $params as map:map,
        $input as document-node()*
) as document-node()*
{
    let $colNameToPurge := map:get($params,"collectionName")
    let $perimeter := cts:collection-query($colNameToPurge)
    let $diff := 100
    let $count := fn:ceiling(xdmp:estimate(cts:search(doc(),$perimeter)) div $diff)
    for $StartUri in getNext(0,$count,$diff,(), $perimeter)
    return xdmp:spawn-function(function(){
        for $uri in cts:uris($StartUri,"limit="||$diff,$perimeter)
        return xdmp:document-delete($uri)
    })
};
