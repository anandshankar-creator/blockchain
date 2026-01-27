// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/metatx/ERC2771Context.sol";

contract Voting is ERC2771Context {
    uint256 public _voterId;
    uint256 public _candidateId;

    address public votingOrganizer;

    // Candidate for voting
    struct Candidate {
        uint256 candidateId;
        string age;
        string name;
        string image;
        uint256 voteCount;
        address _address;
        string ipfs;
    }

    event CandidateCreate (
        uint256 indexed candidateId,
        string age,
        string name,
        string image,
        uint256 voteCount,
        address _address,
        string ipfs
    );

    address[] public candidateAddress;
    mapping(address => Candidate) public candidates;

    // Voter data
    struct Voter {
        uint256 voter_voterId;
        string voter_name;
        string voter_image;
        address voter_address;
        uint256 voter_allowed;
        bool voter_voted;
        uint256 voter_vote;
        string voter_ipfs;
    }

    event VoterCreated (
        uint256 indexed voter_voterId,
        string voter_name,
        string voter_image,
        address voter_address,
        uint256 voter_allowed,
        bool voter_voted,
        uint256 voter_vote,
        string voter_ipfs
    );

    address[] public votedVoters;
    address[] public votersAddress;
    mapping(address => Voter) public voters;

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {
        votingOrganizer = _msgSender();
    }

    function setCandidate(address _address, string memory _age, string memory _name, string memory _image, string memory _ipfs) public {
        require(votingOrganizer == _msgSender(), "Only organizer can create a candidate");

        _candidateId++;
        uint256 idNumber = _candidateId;

        Candidate storage candidate = candidates[_address];
        candidate.candidateId = idNumber;
        candidate.age = _age;
        candidate.name = _name;
        candidate.image = _image;
        candidate.voteCount = 0;
        candidate._address = _address;
        candidate.ipfs = _ipfs;

        candidateAddress.push(_address);

        emit CandidateCreate(
            idNumber,
            _age,
            _name,
            _image,
            candidate.voteCount,
            _address,
            _ipfs
        );
    }

    function getKey() public view returns (address[] memory) {
        return candidateAddress;
    }

    function getCandidate() public view returns (address[] memory) {
        return candidateAddress;
    }

    function getCandidateLength() public view returns (uint256) {
        return candidateAddress.length;
    }

    function getCandidateData(address _address) public view returns (string memory, string memory, uint256, string memory, uint256, string memory, address) {
        return (
            candidates[_address].age,
            candidates[_address].name,
            candidates[_address].candidateId,
            candidates[_address].image,
            candidates[_address].voteCount,
            candidates[_address].ipfs,
            candidates[_address]._address
        );
    }

    // Voter Section
    function setVoter(address _address, string memory _name, string memory _image, string memory _ipfs) public {
        require(votingOrganizer == _msgSender(), "Only organizer can create a voter");

        _voterId++;
        uint256 idNumber = _voterId;

        Voter storage voter = voters[_address];
        voter.voter_voterId = idNumber;
        voter.voter_name = _name;
        voter.voter_image = _image;
        voter.voter_address = _address;
        voter.voter_allowed = 1;
        voter.voter_voted = false;
        voter.voter_vote = 1000;
        voter.voter_ipfs = _ipfs;

        votersAddress.push(_address);

        emit VoterCreated(
            idNumber,
            _name,
            _image,
            _address,
            voter.voter_allowed,
            voter.voter_voted,
            voter.voter_vote,
            _ipfs
        );
    }

    function giveVote(address _candidateAddress, uint256 _candidateVoteId) public {
        Voter storage voter = voters[_msgSender()];
        require(!voter.voter_voted, "You have already voted");
        require(voter.voter_allowed != 0, "You have no right to vote");

        voter.voter_voted = true;
        voter.voter_vote = _candidateVoteId;

        votedVoters.push(_msgSender());

        candidates[_candidateAddress].voteCount += 1;
    }

    function getVoterLength() public view returns (uint256) {
        return votersAddress.length;
    }

    function getVoterData(address _address) public view returns (uint256, string memory, string memory, address, string memory, bool, uint256) {
        return (
            voters[_address].voter_voterId,
            voters[_address].voter_name,
            voters[_address].voter_image,
            voters[_address].voter_address,
            voters[_address].voter_ipfs,
            voters[_address].voter_voted,
            voters[_address].voter_allowed
        );
    }

    function getVotedVoterList() public view returns (address[] memory) {
        return votedVoters;
    }

    function getVoterList() public view returns (address[] memory) {
        return votersAddress;
    }

    // RESET FUNCTION (Prepares for next election)
    // Clears the arrays that track active candidates/voters.
    // Mappings remain but are inaccessible because the arrays (keys) are empty.
    function resetElection() public {
        require(votingOrganizer == _msgSender(), "Only organizer can reset the election");
        
        // Clear Arrays
        delete candidateAddress;
        delete votersAddress;
        delete votedVoters;

        // Reset Counters
        _candidateId = 0;
        _voterId = 0;
    }
}
