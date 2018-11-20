---
title: Flux Container
categories: JS
---
I was reading source code of [Flux](https://github.com/facebook/flux).
The FluxContainer is the most complicated part.
It took me some time to understand how it works and why.

There are 3 parts:

- [FluxContainer](https://github.com/facebook/flux/blob/master/src/container/FluxContainer.js)
- [FluxContainerSubscriptions](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js)
- [FluxStoreGroup](https://github.com/facebook/flux/blob/master/src/FluxStoreGroup.js).

IMO, FluxContainerSubscriptions and FluxStoreGroup help FluxContainer manage subscription to stores.

A FluxContainer [has a FluxContainerSubscriptions](https://github.com/facebook/flux/blob/master/src/container/FluxContainer.js#L133).
FluxContainerSubscriptions [registers listeners](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js#L63)
to each of FluxContainer's subscribed stores.
The listeners will [toggle a changed flag](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js#L62)
from false to true once any of the stores consumes action.

FluxContainerSubscriptions [builds FluxStoreGroup](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js#L77)
every time its FluxContainer subscribes to a set of stores.
The build requires a function
which calls [FluxContainer's setState](https://github.com/facebook/flux/blob/master/src/container/FluxContainer.js#L135)
if [any of the stores changed](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js#L66).
The function will be [registered as a callback of dispatcher](https://github.com/facebook/flux/blob/master/src/FluxStoreGroup.js#L37),
which waits for update of all subscribed stores before invocation.

There are 2 kinds of unsubscription in Flux: container unsubscribes to store
and store unsubscribes to dispatcher.
In the first case, if a container unsbscribes to a store through change of getStore,
[listeners to stores](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js#L49) and
[callback to dispatcher](https://github.com/facebook/flux/blob/master/src/container/FluxContainerSubscriptions.js#L50)
reset.
In the second case, if a store unsubscribe to dispatcher,
since dispatch and store listeners are just two sides of same coin, store listeners will never be invoked,
so it will not notify any changes to container.

In Flux, stores are not just app state. They also serve as domains of changes,
and store changes might have waitFor relationships between each other.
In Redux, individule reducer functions (before aggregated by [combineReducers](https://redux.js.org/api/combinereducers))
represent domain of changes, but there are only one central store.
In comparison, app state in Flux archecture's is a more complex system.
