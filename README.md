# Cryptocracy
Cryptocracy is an open-source ecosystem for developing secure, end-to end,
encrypted systems.

The key overriding principle of cryptocracy is that all encryption, decryption,
key creation and key requests are only ever handled in frontend code. Backend
systems may gain access to public keys for the purpose of verifying API
accessibility. *This may also be done using an API directly to the key manager
store to validate signatures?*

## Terminology

- *Symmetric Encryption* - Symmetric encryption is a method of encrypting data
that uses a single, secret key for both encryption and decryption. Both the
sender and receiver must share the same key to successfully encrypt and decrypt
the information. This approach is also known as "private key encryption".

- *Asymmetric Encryption* - Asymmetric encryption, also known as public key
encryption, uses two mathematically linked keys: a private key and a public
key. One key is kept secret (private), while the other can be shared publicly.
Encryption using the public key can only be decrypted using the corresponding
private key, and vice-versa.

- *Digital signing* - A digital signature is a way to verify the origin of data.
Data that is signed is not itself necessarily encrypted. The creation of a
signature will use one half of a key pair (usually private) and the verification
of the signature is done using the other that the receiver must have.

- *Symmetric key* - a cryptographic token that can be used to both encrypt and
decrypt data using a symmetric encryption algorithm

- *Asymmetric key pair* - the public and private key pair used in an asymmetric
encryption algorithm

- *Personal key pair* - an asymmetric key pair unique to a user across all
systems. Only the public key will ever get beyond the user's frontend browser.

- *Application key pair* - an asymmetric key pair that identifies a person
within a specific application or family of applications. Only the public key
will ever get beyond the user's frontend browser.

- *Grant key pair* - when an application is enable by a user, this key pair is
used later during login to verify possession by the application. Only the grant
public key is provided to the application

- *TTL* - Time to live. This specifies how long a given token is available to be
used. After the TTL has elapsed, the token is no longer valid.

- *Application* - user facing code that runs in the cryptocracy ecosystem that
implements a set of features

- *Client* - Another name for application

- *Frontend* - code that runs in the user's browser

- *Backend* - code that runs elsewhere in the cloud

- *Component* - an independent set of functionality that resides at a particular
address. Components should only implement one set of functions.


## Minimum Security Requirements
This is a minimum set of requirements for all components running in a
cryptocracy system.

* Every component has it's own public and private key. The private key will be
used to sign all information that flows between components. The public key
should be open to all other components

* All content at rest or in flight must be encrypted.

* All content at rest must be signed by the component's private key to prevent
insertion of malicious data

* All components have to assume an attacker can read, add and remove data
directly to and from a database. Given that reality, an attacker should be
unable to read content or inject malicious content with possession or direct
access to the database. No code can rely on code path inhibitions to protect
content.

* Security should be maintained even if all traffic takes place over an unsecure
connection.

* All keys should be generated and requested by the frontend

* All encryption takes place on the front end

* Access to the database should not provide access to keys necessary to read or
write the content.

* Keys should never be stored with any non-key data.

* To prevent replay attacks, a challenge/response mechanism needs to be
implemented on all APIs. This will generate a one-time code for the next
request. The challenge code itself cannot maintain all the data necessary to
verify its correctness. One-time use codes should have an appropriate TTL. A
challenge request should be signed by the challenger and the response should
be signed by the responder. A challenge key request does not itself require a
challenge code.

# Identity Provider
Proves the identity of a person. This can be through an oauth provider, an mfa
system, single sign on, or other trusted sources.

# Personal Key Locker (owned by user)

This is a user chosen and trusted system to make methods available to trusted
applications that can perform cryptographic functions on the user's personal
and application keys. The actual keys will remain inaccessible.

The locker should be provided as a linkable JS file that must run all code with
direct key access inside of an iframe. There will be a standard library API that
must be implemented by all key lockers.

Access to the locker requires proof of identity using an identity provider or
local possession of an item.

In addition to registration and signin, the locker will implement an api with
these functions: encrypt, decrypt, sign, verify, extend TTL

These methods will only work with the user's application key pair and must
specify which half of the pair to use. The actual keys must never leak out of
private javascript space.

## External locker requirements
If the data for a locker resides in an external location, then the data at rest
must not be readable by somebody in possession of the database.

The locker must possess an asymmetric key pair, with the private key kept a
closely guarded secret. The private key will need to be made available to the
code. Data in the database will be encrypted using the public key of the pair,
but signed with the private key to assure authenticity. This will prevent a bad
actor inserting malicious data if they know the public key.

A hardware version of a locker could be available through a USB connection.

## Flows

**Application Registration**
1. Client frontend requests application permissions to locker frontend. This
contains the application id and application public key
2. Locker identifies user (oauth/mfa/sso/etc)
3. Locker frontend requests access on behalf of application
4. Locker frontend creates a grant key pair and a user key pair.
5. Locker backend stores key pairs, locker provides challenge code
6. Client frontend is given the grant public key and challenge code
7. Client makes login request with this data

**Login**
1. Client frontend initiates request to locker frontend, with application
identifier and signed with application private key.
2. Locker executes identity check (oauth/mfa/sso/etc)
3. Locker backend provides challenge string, user id and grant id to frontend
which passes to client frontend
4. Client constructs request with challenge string, grant id, client id, signed
with app private key, then signed with grant public key
5. Client passes this to locker front end
7. Locker backend provides to locker frontend:
    *   JWT: Proof of identity, access code, TTL, The application public key
    *   application and user key sets
8. JWT is returned to client frontend, keys are kept in locker frontend

Communication between locker frontend and backend will be handled through one-
time codes, client generated key pairs and user identity check

# Session Manager (owned by client)

Given the JWT from the personal locker (probably initiates it)

Constructs session JWT with: session code, application user information, TTL, is
signed with session manager private key

The JWT can be saved in a session cookie, or application header, or passed as a
bearer token

## Flows

**Login**

**Register**

**Validate Session**
1. verify session signature
2. verify TTL
3. Access user information from JWT


# Public Key Store?

List of all users and their public keys

# Permissions Store

The use of a permissions store is optional and may not be needed in a simple
application.

The permissions store is a separate key store used by applications to limit code
flows. These keys are not used to protect data in the database, so unauthorized
access can still be used to bypass all permission. Subverting permissions cannot
be used to gain access to content keys.

There are four kinds of permissions:
     * Read - The user can read this content
     * Write - The user can write this content
     * Delete - The user can delete this content
     * List - The user can list items of this content

The frontend can request the permission keys for an entity and will receive the
appropriate public permission keys encrypted with their application key


## Flows

**Create Entity**
1. Frontend creates permissioning key pairs
2. Permission keys are saved in permissions store

**Assign Permissions**
1. The client frontend creates a permissions record with the public keys of all
permissions and encrypted with the grantee's public application key
2. The permission store saves the permissions record indexed on entity id and
userid

**Rotate Keys**


**Permissioned APIs**
1. Client frontend gets the permission keys for the entity being acted on
2. Client frontend signs the request with the applicable permission public key

**Verify**
1. For every permissioned API, the client backend passes the signed request, the
entity id, the userid and the required permission to the permissioning service
2. The permissioning service validates and signs the result
3. The client proceeds or errors as appropriate


# Keystore
The keystore provides the mapping between an identifier, a user and a set of
keys. All access to the keystore is handled by the frontend. Keys are signed by
the key manager to validate authenticity, but generated and encrypted by
frontends. The keystore doesn't have access to the actual keys, so keys are
simply opaque blobs of data.

Users with the right permissions can get the full list of users and their public
keys for a context (how? see permissioning system)

## Flows

**Add Key**
1. frontend generates or acquires a key or key pair
2. frontend encrypts keys using the grantee's public application key
3. the front end sends this data to the store:
    * the encrypted keys
    * the user id
    * the key id
4. the keystore signs the encrypted keys
5. the keystore saves the keys indexed on user and identifier

**Get Key EH?**
1. frontend requests all keys or keys of a type for the given user
2. relevant keys are collected and packaged
3. unencrypted keys are returned to user

**Rotate Key**
1. frontend requests list of users with keys for key id
2. keystore collects and returns user ids
3. frontend generate new keys
4. for each user frontend writes new generated key

**Revoke Key**
1. frontend request key revocation for user and key id
2. keystore deletes key record


# Security Context
A security context is used to provide accessibility of content to application
users. Each user that is part of a security context will have access to the keys
necessary to read and write associated content. Each security context has two
sets of keys. The first set of keys provides access to administrative features
and content. The second set of keys provides access to the application content.
Each user with access to the security context will have a record in the key
store with the applicable keys and encrypted with the user's public application
key.

*is a userid a security context?*

## Flows:

**context creation:**
1. Owner creates a set of management keys
2. Owner creates a set of access keys
3. Management keys are encrypted using owner's public application key
4. Access keys are encrypted using user's public application key
3. Keys are stored in key store

**access context**
1. request keys from keystore
2. decrypt using users application key

**share context admin:**
1. management keys are encrypted using new user's public application key
2. keys are stored in key store

**grant context access:**
1. Access keys are encrypted using new user's public application key
2. keys are saved in keystore

**revocation:**
1. remove from key store

**key rotation:**
1. front end generates new keys
2. new records are written out using available public keys

## Data Store

## Data Root
A data root specifies a point where content can be added. It has an identifier,
a primary context, and metadata signed with the primary context private key.
*The public key of the primary context is available to the code?*.

## Wrapped Key
A wrapped symmetric key an asymmetric key pair with a unique identifier. Wrapped
keys are stored with one entry per security context with access to the key. The
key is encrypted with the security context's private/write key. Although wrapped
keys can be reused, they should not be unless all content using that wrapped key
should always be available to the all security contexts. Shared content should
always be reencrypted using a new wrapped key.

## Data Nodes
Every piece of data is encrypted with a wrapped key. All contexts that have
access to that wrapped key can read the data.

## Metadata
Data saved in a datastore will have associated metadata needed for proper
operation. This metadata will include things such as identifiers and sequence
numbers. To prevent data leaking, no real-world identifiable information should
be inferable from this metadata. This would include things like search terms
and dates. Data searching should be performed using a separate indexing service.
Content that needs to be in sequence can use sequential numbers but not if these
are tied to real dates, that means no epoch values. Any date demarcations have
to be saved in a separate indexing service or as root metadata used by the
frontend.

### Flows

**create wrapped key**
1. client frontend generates new key/key pair
2. client frontend creates unique id for wrapped key
2. client frontend creates a new entry for every applicable security context it
has the write key for
3. wrapped key entries are saved in the key store

**create data:**
1. client creates data
2. client encrypts content with new or existing wrapped key depending on
context.
3. content and wrapped key id is signed using the primary-context private/write
key
4. Encrypted data and wrapped key identifier are saved in store.


**read data:**
1. Front-end requests data
2. Encrypted data is returned along with key wrapper identifier
3. content key is acquired through wrapper and content is decrypted


Gaining access to wrapped keys is done through key store

## Indexer
The indexer will index content for searching. This can either work on plain
text if the indexer sits behind a firewall, or text that has been tokenized by
the client.
