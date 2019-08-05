from plugins.factgraph.app.factgraph_api import FactGraphAPI

name = "FactGraph"
description = "D3 fact and ability relationship graph"
address = "plugins/factgraph/gui"


async def initialize(app, services):
    factgraph = FactGraphAPI(services)
    app.router.add_static('/factgraph', 'plugins/factgraph/static', append_version=True)
    app.router.add_route('GET', '/plugins/factgraph/gui', factgraph.landing)
    app.router.add_route('*', '/plugins/factgraph/rest', factgraph.rest_api)
