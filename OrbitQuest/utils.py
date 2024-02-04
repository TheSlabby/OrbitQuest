def getGeoKey():
    return open('.key','r').readlines()[0].strip()
def getNasaKey():
    return open('.key', 'r').readlines()[1].strip()